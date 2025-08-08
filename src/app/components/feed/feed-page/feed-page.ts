import { Component, inject } from '@angular/core';
import { ArticleService } from '../../../core/services/article-service';
import { Article } from '../../../shared/types/article';
import { firstValueFrom } from 'rxjs';
import { ArticleList } from '../../../shared/components/article-list/article-list';

@Component({
  selector: 'app-feed-page',
  imports: [ArticleList],
  templateUrl: './feed-page.html',
  styleUrl: './feed-page.css',
})
export class FeedPage {
  private readonly articleService = inject(ArticleService);

  getFeed = async (from: number, to: number): Promise<Article[]> => {
    return firstValueFrom(this.articleService.getFeed(from, to));
  };
}
