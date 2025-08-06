import { Component, effect, inject, signal } from '@angular/core';
import { ArticleService } from '../../../core/services/article-service';
import { Article } from '../../../shared/types/article';
import { firstValueFrom } from 'rxjs';
import { FeedCard } from '../feed-card/feed-card';

@Component({
  selector: 'app-feed-page',
  imports: [FeedCard],
  templateUrl: './feed-page.html',
  styleUrl: './feed-page.css',
})
export class FeedPage {
  private readonly articleService = inject(ArticleService);

  articles = signal<Article[]>([]);
  isLoading = signal<boolean>(true);

  constructor() {
    this.getFeed(0, 20)
      .then((articles) => this.articles.set(articles))
      .catch((error) => console.error('Error loading feed:', error))
      .finally(() => this.isLoading.set(false));
  }

  private async getFeed(from: number, to: number): Promise<Article[]> {
    return firstValueFrom(this.articleService.getFeed(from, to));
  }
}
