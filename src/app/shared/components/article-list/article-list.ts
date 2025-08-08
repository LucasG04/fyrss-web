import {
  AfterViewInit,
  Component,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { ArticleCard } from '../article-card/article-card';
import { Loader } from '../loader/loader';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { fromEvent, filter, firstValueFrom } from 'rxjs';
import { ArticleService } from '../../../core/services/article-service';
import { Article } from '../../types/article';

@UntilDestroy()
@Component({
  selector: 'app-article-list',
  imports: [ArticleCard, Loader],
  templateUrl: './article-list.html',
  styleUrl: './article-list.css',
})
export class ArticleList implements OnInit, AfterViewInit {
  private readonly articleService = inject(ArticleService);

  getArticles =
    input.required<(from: number, to: number) => Promise<Article[]>>();

  articles = signal<Article[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.getArticles()(0, 20)
      .then((articles) => this.articles.set(articles))
      .catch((error) => console.error('Error loading feed:', error))
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
          console.log(
            'Load',
            this.articles().length,
            this.articles().length + 20
          );
          this.isLoading.set(true);
          const next = await this.getArticles()(
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
}
