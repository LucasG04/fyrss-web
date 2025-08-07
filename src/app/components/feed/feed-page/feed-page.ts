import { AfterViewInit, Component, inject, signal } from '@angular/core';
import { ArticleService } from '../../../core/services/article-service';
import { Article } from '../../../shared/types/article';
import { filter, firstValueFrom, fromEvent } from 'rxjs';
import { ArticleCard } from '../../../shared/components/article-card/article-card';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Loader } from '../../../shared/components/loader/loader';

@UntilDestroy()
@Component({
  selector: 'app-feed-page',
  imports: [ArticleCard, Loader],
  templateUrl: './feed-page.html',
  styleUrl: './feed-page.css',
})
export class FeedPage implements AfterViewInit {
  private readonly articleService = inject(ArticleService);

  articles = signal<Article[]>([]);
  isLoading = signal<boolean>(true);

  constructor() {
    this.getFeed(0, 20)
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
          this.isLoading.set(true);
          const next = await this.getFeed(
            this.articles().length,
            this.articles().length + 20
          );
          this.articles.set([...this.articles(), ...next]);
          this.isLoading.set(false);
        }
      });
  }

  private async getFeed(from: number, to: number): Promise<Article[]> {
    return firstValueFrom(this.articleService.getFeed(from, to));
  }
}
