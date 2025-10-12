import { Component, inject, signal } from '@angular/core';
import { ArticleService } from '../../../core/services/article-service';
import { Article } from '../../../shared/types/article';
import { firstValueFrom, take } from 'rxjs';
import { RssFeedService } from '../../../core/services/rss-feed-service';
import { RssFeed } from '../../../shared/types/rss-feed';
import { Router } from '@angular/router';

interface RssFeedWithArticles extends RssFeed {
  articles: Article[];
}

@Component({
  selector: 'app-feed-page',
  imports: [],
  templateUrl: './feed-page.html',
  styleUrl: './feed-page.css',
})
export class FeedPage {
  private readonly articleService = inject(ArticleService);
  private readonly feedService = inject(RssFeedService);
  private readonly router = inject(Router);

  feeds = signal<RssFeedWithArticles[]>([]);

  constructor() {
    this.feedService
      .getAll()
      .pipe(take(1))
      .subscribe(async (feeds) => {
        const articles = await Promise.all(
          feeds.map((feed) =>
            firstValueFrom(this.articleService.getPaginatedFeed(feed.id, 0, 4))
          )
        );
        const feedsWithArticles = feeds.map((feed, index) => ({
          ...feed,
          articles: articles[index],
        }));
        this.sortFeedsByArticleDates(feedsWithArticles);

        this.feeds.set(feedsWithArticles);
      });
  }

  goToFeed(feedId: string): void {
    this.router.navigate(['/feed', feedId]);
  }

  private sortFeedsByArticleDates(feeds: RssFeedWithArticles[]): void {
    feeds.sort((a, b) => {
      const aLatest = new Date(a.articles[0]?.publishedAt || 0);
      const bLatest = new Date(b.articles[0]?.publishedAt || 0);
      return bLatest.getTime() - aLatest.getTime();
    });
  }
}
