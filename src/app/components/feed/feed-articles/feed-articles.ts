import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ArticleService } from '../../../core/services/article-service';
import { firstValueFrom } from 'rxjs';
import { Article } from '../../../shared/types/article';
import { RssFeedService } from '../../../core/services/rss-feed-service';
import { RssFeed } from '../../../shared/types/rss-feed';
import { ArticleList } from '../../../shared/components/article-list/article-list';

@Component({
  selector: 'app-feed-articles',
  imports: [ArticleList],
  templateUrl: './feed-articles.html',
  styleUrl: './feed-articles.css',
})
export class FeedArticles {
  private readonly route = inject(ActivatedRoute);
  private readonly articleService = inject(ArticleService);
  private readonly rssFeedService = inject(RssFeedService);

  rssFeed = signal<RssFeed | null>(null);

  constructor() {
    const feedId = this.route.snapshot.paramMap.get('id');

    if (!feedId) {
      throw new Error('Feed ID is required');
    }

    firstValueFrom(this.rssFeedService.getById(feedId))
      .then((feed) => this.rssFeed.set(feed))
      .catch((err) => {
        console.error('Error loading feed:', err);
        this.rssFeed.set(null);
      });
  }

  getFeed = async (from: number, to: number): Promise<Article[]> => {
    const feedId = this.route.snapshot.paramMap.get('id');
    if (!feedId) return [];

    return await firstValueFrom(
      this.articleService.getPaginatedFeed(feedId, from, to)
    );
  };
}
