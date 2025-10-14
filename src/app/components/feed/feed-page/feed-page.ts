import { Component, inject, signal } from '@angular/core';
import { ArticleService } from '../../../core/services/article-service';
import { Article } from '../../../shared/types/article';
import { firstValueFrom } from 'rxjs';
import { RssFeedService } from '../../../core/services/rss-feed-service';
import { RssFeed } from '../../../shared/types/rss-feed';
import { Router } from '@angular/router';
import { Loader } from '../../../shared/components/loader/loader';

interface RssFeedWithArticles extends RssFeed {
  articles: Article[];
}

@Component({
  selector: 'app-feed-page',
  imports: [Loader],
  templateUrl: './feed-page.html',
  styleUrl: './feed-page.css',
})
export class FeedPage {
  private readonly articleService = inject(ArticleService);
  private readonly feedService = inject(RssFeedService);
  private readonly router = inject(Router);

  feeds = signal<RssFeedWithArticles[]>([]);
  isLoading = signal(true);
  hasError = signal(false);

  /** After 7 days, the recency score halves */
  private static readonly RECENCY_HALF_LIFE_DAYS = 7;
  /** Strength of the "rarely publishing" boost */
  private static readonly RARITY_ALPHA = 0.3;
  /** Used when there is too little data */
  private static readonly DEFAULT_INTERVAL_DAYS = 14;
  private static readonly MIN_ARTICLES_FOR_INTERVAL = 2;

  constructor() {
    this.loadFeeds();
  }

  goToFeed(feedId: string): void {
    this.router.navigate(['/feed', feedId]);
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
            firstValueFrom(this.articleService.getPaginatedFeed(feed.id, 0, 4))
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
   * Sort feeds by a combined score: score = recency * (1 + alpha * rarity)
   * Higher score first.
   */
  private sortFeedsByRecencyAndRarity(
    feeds: RssFeedWithArticles[]
  ): RssFeedWithArticles[] {
    return feeds
      .map((f) => ({ feed: f, score: this.scoreFeed(f) }))
      .toSorted((a, b) => {
        // primary: score desc
        if (b.score !== a.score) {
          return b.score - a.score;
        }

        // tie-breaker 1: latest article date desc
        const aLatest = this.getLatestDate(a.feed.articles);
        const bLatest = this.getLatestDate(b.feed.articles);
        if (bLatest.getTime() !== aLatest.getTime())
          return bLatest.getTime() - aLatest.getTime();

        // tie-breaker 2: by feed name
        return (a.feed.name ?? '').localeCompare(b.feed.name ?? '');
      })
      .map((x) => x.feed);
  }

  private scoreFeed(feed: RssFeedWithArticles): number {
    const latest = this.getLatestDate(feed.articles);
    const ageDays = this.daysBetween(latest, new Date());

    const recency = this.recencyScore(ageDays, FeedPage.RECENCY_HALF_LIFE_DAYS);
    const rarity = this.rarityScore(feed.articles);

    return recency * (1 + FeedPage.RARITY_ALPHA * rarity);
  }

  /** Exponential decay by age in days, half-life parameterized. Range (0,1]. */
  private recencyScore(ageDays: number, halfLifeDays: number): number {
    if (!isFinite(ageDays) || ageDays < 0) {
      return 1;
    }
    const lambda = Math.log(2) / Math.max(halfLifeDays, 1e-3);
    return Math.exp(-lambda * ageDays);
  }

  /**
   * Rarity: log2(1 + median interval days).
   * Larger intervals (rarere publishing) yield higher values.
   */
  private rarityScore(articles: Article[]): number {
    const medianInterval = this.medianIntervalDays(articles);
    // log2 keeps growth moderate and robust against outliers
    return Math.log2(1 + Math.max(0, medianInterval));
  }

  /**
   * Latest publishedAt, but no date in the future.
   * If all articles are in the future, take the earliest of them.
   */
  private getLatestDate(articles: Article[]): Date {
    if (!articles?.length) {
      return new Date(0);
    }

    const now = Date.now();
    const validDates = articles
      .map((a) => new Date(a?.publishedAt ?? 0))
      .filter((d) => Number.isFinite(d.getTime()));

    if (!validDates.length) {
      return new Date(0);
    }

    const pastOrPresent = validDates.filter((d) => d.getTime() <= now);

    if (pastOrPresent.length > 0) {
      const latestPast = pastOrPresent.reduce(
        (latest, d) => (d.getTime() > latest.getTime() ? d : latest),
        new Date(0)
      );
      return latestPast;
    }

    const earliestFuture = validDates.reduce(
      (earliest, d) => (d.getTime() < earliest.getTime() ? d : earliest),
      validDates[0]
    );

    return earliestFuture;
  }

  /**
   * Median of consecutive publishedAt intervals (in days).
   * Requires at least 2 articles; otherwise returns DEFAULT_INTERVAL_DAYS.
   */
  private medianIntervalDays(articles: Article[]): number {
    const items = (articles ?? [])
      .map((a) => new Date(a?.publishedAt ?? 0))
      .filter((d) => Number.isFinite(d.getTime()))
      .toSorted((a, b) => b.getTime() - a.getTime()); // newest to oldest

    if (items.length < FeedPage.MIN_ARTICLES_FOR_INTERVAL) {
      return FeedPage.DEFAULT_INTERVAL_DAYS;
    }

    const intervals: number[] = [];
    for (let i = 0; i < items.length - 1; i++) {
      const days = this.daysBetween(items[i + 1], items[i]); // older to newer
      if (Number.isFinite(days) && days >= 0) intervals.push(days);
    }

    if (!intervals.length) {
      return FeedPage.DEFAULT_INTERVAL_DAYS;
    }

    intervals.sort((a, b) => a - b);
    const mid = Math.floor(intervals.length - 1 / 2);
    return intervals.length % 2 === 0
      ? (intervals[mid] + intervals[mid - 1]) / 2
      : intervals[mid];
  }

  /** Difference in days between two dates (absolute). */
  private daysBetween(a: Date, b: Date): number {
    const ms = Math.abs(b.getTime() - a.getTime());
    return ms / (1000 * 60 * 60 * 24);
  }
}
