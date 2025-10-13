import {
  AfterViewInit,
  Component,
  inject,
  input,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { ArticleCard } from '../article-card/article-card';
import { Loader } from '../loader/loader';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  fromEvent,
  filter,
  catchError,
  animationFrameScheduler,
  auditTime,
  distinctUntilChanged,
  EMPTY,
  exhaustMap,
  map,
  from,
} from 'rxjs';
import { Article } from '../../types/article';
import { isPlatformBrowser } from '@angular/common';

@UntilDestroy()
@Component({
  selector: 'app-article-list',
  imports: [ArticleCard, Loader],
  templateUrl: './article-list.html',
  styleUrl: './article-list.css',
})
export class ArticleList implements OnInit, AfterViewInit {
  private readonly platformId = inject(PLATFORM_ID);

  getArticles =
    input.required<(from: number, to: number) => Promise<Article[]>>();

  articles = signal<Article[]>([]);
  isLoading = signal<boolean>(true);
  isLoadingMore = signal<boolean>(false);
  hasError = signal<boolean>(false);

  private pageSize = 20;
  private isRequestInProgress = false;

  ngOnInit(): void {
    this.loadInitialArticles();
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      fromEvent(window, 'scroll')
        .pipe(
          // keep the stream lightweight: once per frame is enough
          auditTime(0, animationFrameScheduler),
          untilDestroyed(this),
          // gate early: only continue if list is non-empty and not already requesting
          filter(() => this.articles().length > 0 && !this.isRequestInProgress),
          // compute "near bottom"
          map(() => {
            const scrollPosition = window.scrollY + window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollThreshold = window.innerHeight * 0.2;
            return (
              scrollPosition >= documentHeight - scrollThreshold &&
              !this.isLoading() &&
              !this.isLoadingMore()
            );
          }),
          distinctUntilChanged(), // only react on "near bottom" flip
          filter(Boolean),
          // do not cancel in-flight; ignore new triggers until done
          exhaustMap(() => {
            return from(this.loadMoreArticles()).pipe(
              // Keep stream alive even if loadMoreArticles rejects
              catchError(() => EMPTY)
            );
          })
        )
        .subscribe();
    }
  }

  async loadInitialArticles(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.hasError.set(false);

      const articles = await this.getArticles()(0, this.pageSize);

      this.articles.set(articles);
    } catch (error) {
      console.error('Error loading initial articles:', error);
      this.hasError.set(true);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async loadMoreArticles(): Promise<void> {
    if (this.isRequestInProgress) {
      return;
    }

    try {
      this.isRequestInProgress = true;
      this.isLoadingMore.set(true);
      this.hasError.set(false);

      const currentLength = this.articles().length;
      const newArticles = await this.getArticles()(
        currentLength,
        currentLength + this.pageSize
      );

      if (newArticles.length === 0) {
        // No more articles to load
        return;
      }

      if (newArticles.length > 0) {
        this.articles.set([...this.articles(), ...newArticles]);
      }
    } catch (error) {
      console.error('Error loading more articles:', error);
      this.hasError.set(true);
    } finally {
      this.isLoadingMore.set(false);
      // this.isRequestInProgress = false;
    }
  }
}
