import { Component, inject, signal } from '@angular/core';
import { ArticleService } from '../../../core/services/article-service';
import { Article } from '../../../shared/types/article';
import { firstValueFrom } from 'rxjs';
import { RssFeedService } from '../../../core/services/rss-feed-service';
import { RssFeed } from '../../../shared/types/rss-feed';
import { Router } from '@angular/router';
import { Loader } from '../../../shared/components/loader/loader';
import { PulseIndicator } from '../../../shared/components/pulse-indicator/pulse-indicator';
import { FeedLastReadService } from '../../../core/services/feed-last-read-service';

interface RssFeedWithArticles extends RssFeed {
  articles: Article[];
}

interface ScoredFeed {
  feed: RssFeedWithArticles;
  score: number;
}

@Component({
  selector: 'app-feed-page',
  imports: [Loader, PulseIndicator],
  templateUrl: './feed-page.html',
  styleUrl: './feed-page.css',
})
export class FeedPage {
  private readonly articleService = inject(ArticleService);
  private readonly feedService = inject(RssFeedService);
  private readonly router = inject(Router);
  private readonly feedLastReadService = inject(FeedLastReadService);

  feeds = signal<RssFeedWithArticles[]>([]);
  isLoading = signal(true);
  hasError = signal(false);

  // Frequency-adjusted recency scoring parameters
  private static readonly FAST_FEED_HALF_LIFE_DAYS = 2; // for daily news feeds
  private static readonly SLOW_FEED_HALF_LIFE_DAYS = 14; // for weekly newsletters
  private static readonly FREQUENCY_THRESHOLD_DAYS = 3; // feeds posting more often than this are "fast"
  private static readonly MIN_ARTICLES_FOR_FREQUENCY = 3; // minimum articles needed to calculate frequency

  constructor() {
    this.loadFeeds();
  }

  goToFeed(feedId: string): void {
    this.router.navigate(['/feed', feedId]);
    this.feedLastReadService.setLastRead(feedId, Date.now());
  }

  hasNewArticles(feed: RssFeedWithArticles): boolean {
    const lastRead = this.feedLastReadService.getLastRead(feed.id);
    if (lastRead === null) {
      return false;
    }
    return feed.articles.some(
      (article) => new Date(article.publishedAt).getTime() > lastRead
    );
  }

  goToRssFeedManagement(): void {
    this.router.navigate(['/rss-feeds']);
  }

  async loadFeeds(): Promise<void> {
    this.isLoading.set(true);
    this.hasError.set(false);

    firstValueFrom(this.feedService.getAll())
      .then(async (feeds) => {
        const articlesPerFeed = await Promise.all(
          feeds.map((feed) =>
            firstValueFrom(this.articleService.getPaginatedFeed(feed.id, 0, 5))
          )
        );

        const feedsWithArticles: RssFeedWithArticles[] = feeds.map(
          (feed, idx) => ({
            ...feed,
            articles: articlesPerFeed[idx] ?? [],
          })
        );

        const sorted = this.sortFeedsByRecencyAndRarity(feedsWithArticles);
        this.feeds.set(sorted);
      })
      .catch(() => this.hasError.set(true))
      .finally(() => this.isLoading.set(false));
  }

  /**
   * Sort feeds by frequency-adjusted recency score.
   * Higher score first; ties by latest article date, then by name.
   * Uses different decay rates for fast vs slow feeds to prevent
   * high-frequency news feeds from overwhelming newsletters.
   */
  private sortFeedsByRecencyAndRarity(
    feeds: RssFeedWithArticles[]
  ): RssFeedWithArticles[] {
    return feeds
      .map((f) => ({
        feed: f,
        score: this.scoreFeed(f),
      }))
      .toSorted((a, b) => this.compareScored(a, b))
      .map((x) => x.feed);
  }

  private compareScored(a: ScoredFeed, b: ScoredFeed): number {
    if (b.score !== a.score) return b.score - a.score;

    // tie-breaker 1: latest article date desc
    const aLatest = this.getLatestOrNow(a.feed.articles);
    const bLatest = this.getLatestOrNow(b.feed.articles);
    if (bLatest.getTime() !== aLatest.getTime()) {
      return bLatest.getTime() - aLatest.getTime();
    }

    // tie-breaker 2: by feed name asc (null-safe)
    return (a.feed.name ?? '').localeCompare(b.feed.name ?? '');
  }

  /**
   * Calculates a frequency-adjusted recency score for the feed.
   * Fast feeds decay quickly, slow feeds decay slowly.
   */
  private scoreFeed(feed: RssFeedWithArticles): number {
    const latest = this.getLatestOrNow(feed.articles);
    const ageDays = this.daysBetween(latest, new Date());

    // Calculate appropriate half-life based on feed frequency
    const halfLife = this.getFrequencyAdjustedHalfLife(feed.articles);
    const recency = this.recencyScore(ageDays, halfLife);

    return recency;
  }

  /**
   * Determines the half-life for recency scoring based on feed frequency.
   * Fast feeds (daily news) get shorter half-life, slow feeds (newsletters) get longer half-life.
   */
  private getFrequencyAdjustedHalfLife(articles: Article[]): number {
    const averageInterval = this.getAveragePublishingInterval(articles);

    // If we can't determine frequency or it's very fast, use fast feed settings
    if (
      averageInterval <= 0 ||
      averageInterval <= FeedPage.FREQUENCY_THRESHOLD_DAYS
    ) {
      return FeedPage.FAST_FEED_HALF_LIFE_DAYS;
    }

    // For slower feeds, use longer half-life
    return FeedPage.SLOW_FEED_HALF_LIFE_DAYS;
  }

  /**
   * Calculate average days between articles to determine publishing frequency.
   * Returns 0 if insufficient data.
   */
  private getAveragePublishingInterval(articles: Article[]): number {
    if (!articles || articles.length < FeedPage.MIN_ARTICLES_FOR_FREQUENCY) {
      return 0;
    }

    const intervals = this.intervalDays(articles);
    if (intervals.length === 0) return 0;

    return (
      intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
    );
  }

  /**
   * Exponential decay by age in days, half-life parameterized. Range (0,1].
   * Invalid ages are treated conservatively (small value, not 1).
   */
  private recencyScore(ageDays: number, halfLifeDays: number): number {
    if (!isFinite(ageDays)) {
      return Math.exp(-Math.log(2) * 2);
    }
    const safeAge = Math.max(0, ageDays);
    const lambda = Math.log(2) / Math.max(halfLifeDays, 1e-3);
    return Math.exp(-lambda * safeAge);
  }

  private intervalDays(articles: Article[]): number[] {
    const items = (articles ?? [])
      .map((a) => new Date(a?.publishedAt ?? 0))
      .filter((d) => Number.isFinite(d.getTime()))
      // newest to oldest
      .sort((a, b) => b.getTime() - a.getTime());

    const intervals: number[] = [];
    for (let i = 0; i < items.length - 1; i++) {
      // gap between older and newer
      const days = this.daysBetween(items[i + 1], items[i]);
      if (Number.isFinite(days) && days >= 0) intervals.push(days);
    }
    return intervals;
  }

  /**
   * Latest publishedAt not in the future; if all are future, clamp to now.
   * If no valid dates, return epoch (very old).
   */
  private getLatestOrNow(articles: Article[]): Date {
    if (!articles?.length) return new Date(0);

    const now = Date.now();
    const valid = articles
      .map((a) => new Date(a?.publishedAt ?? 0))
      .filter((d) => Number.isFinite(d.getTime()));

    if (!valid.length) return new Date(0);

    const pastOrPresent = valid.filter((d) => d.getTime() <= now);
    if (pastOrPresent.length > 0) {
      return pastOrPresent.reduce(
        (latest, d) => (d.getTime() > latest.getTime() ? d : latest),
        new Date(0)
      );
    }

    // all in the future, treat as "now" (no penalty)
    return new Date(now);
  }

  /** Non-negative difference in days between two dates. */
  private daysBetween(a: Date, b: Date): number {
    const ms = b.getTime() - a.getTime();
    return Math.max(0, ms) / (1000 * 60 * 60 * 24);
  }
}
