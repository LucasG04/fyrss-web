import { Component, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ArticleService } from '../../core/services/article-service';
import { Article } from '../../shared/types/article';
import { ArticleList } from '../../shared/components/article-list/article-list';

@Component({
  selector: 'app-saved-page',
  imports: [ArticleList],
  templateUrl: './saved-page.html',
  styleUrl: './saved-page.css',
})
export class SavedPage {
  private readonly articleService = inject(ArticleService);

  getSaved = async (from: number, to: number): Promise<Article[]> => {
    return firstValueFrom(this.articleService.getSaved(from, to));
  };
}
