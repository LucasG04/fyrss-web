import { Component, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ArticleService } from '../../core/services/article-service';
import { Article } from '../../shared/types/article';
import { ArticleList } from '../../shared/components/article-list/article-list';

@Component({
  selector: 'app-history-page',
  imports: [ArticleList],
  templateUrl: './history-page.html',
  styleUrl: './history-page.css',
})
export class HistoryPage {
  private readonly articleService = inject(ArticleService);

  getHistory = async (from: number, to: number): Promise<Article[]> => {
    return firstValueFrom(this.articleService.getHistory(from, to));
  };
}
