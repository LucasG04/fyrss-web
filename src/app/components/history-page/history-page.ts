import { Component, inject, signal } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { fromEvent, filter, firstValueFrom } from 'rxjs';
import { ArticleService } from '../../core/services/article-service';
import { Article } from '../../shared/types/article';
import { ArticleCard } from '../../shared/components/article-card/article-card';
import { Loader } from '../../shared/components/loader/loader';

@UntilDestroy()
@Component({
  selector: 'app-history-page',
  imports: [ArticleCard, Loader],
  templateUrl: './history-page.html',
  styleUrl: './history-page.css',
})
export class HistoryPage {
  private readonly articleService = inject(ArticleService);

  articles = signal<Article[]>([]);
  isLoading = signal<boolean>(true);

  constructor() {
    this.getHistory(0, 20)
      .then((articles) => this.articles.set(articles))
      .catch((error) => console.error('Error loading history:', error))
      .finally(() => this.isLoading.set(false));
  }

  ngAfterViewInit(): void {
    // window not defined because of SSR platform has to be checked
    if (typeof window === 'undefined') return;
    fromEvent(window, 'scroll')
      .pipe(
        untilDestroyed(this),
        filter(() => this.articles().length > 0) // Ensure articles are loaded before checking scroll
      )
      .subscribe(async () => {
        const scrollPosition = window.scrollY + window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        if (scrollPosition >= documentHeight - 100 && !this.isLoading()) {
          this.isLoading.set(true);
          const next = await this.getHistory(
            this.articles().length,
            this.articles().length + 20
          );
          this.articles.set([...this.articles(), ...next]);
          this.isLoading.set(false);
        }
      });
  }

  updateArticleSaved(articleId: string, save: boolean): void {
    firstValueFrom(
      this.articleService.updateArticleSaved(articleId, save)
    ).then(() => {
      const updatedArticles = this.articles().map((article) =>
        article.id === articleId ? { ...article, save } : article
      );
      this.articles.set(updatedArticles);
    });
  }

  markAsRead(articleId: string): void {
    firstValueFrom(this.articleService.markAsRead(articleId));
  }

  private async getHistory(from: number, to: number): Promise<Article[]> {
    return firstValueFrom(this.articleService.getHistory(from, to));
  }
}
