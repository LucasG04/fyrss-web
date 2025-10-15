import { Component, computed, inject, model } from '@angular/core';
import { Article } from '../../types/article';
import { ArticleService } from '../../../core/services/article-service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-article-card',
  imports: [],
  templateUrl: './article-card.html',
  styleUrl: './article-card.css',
})
export class ArticleCard {
  private readonly articleService = inject(ArticleService);

  article = model.required<Article>();

  hasLastReadAt = computed<boolean>(() => {
    const startOf2000 = new Date('2000-01-01T00:00:00Z');
    // Backend default date is 1970-01-01
    // If lastReadAt is after 2000, consider it as "has been read"
    return new Date(this.article().lastReadAt) > startOf2000;
  });
  sourceUrlShort = computed<string>(() => {
    const urlString = this.article().sourceUrl;
    if (!urlString) return '';

    const url = new URL(urlString);
    if (!url.hostname) {
      return urlString.length > 30 ? `${urlString.slice(0, 27)}...` : urlString;
    }

    const host = url.hostname.replace('www.', '');
    return `${host}${url.pathname}`;
  });

  getDateFromUtc(dateString: string): string {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }) +
      ' - ' +
      date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  }

  async updateArticleSaved(): Promise<void> {
    await firstValueFrom(
      this.articleService.updateArticleSaved(
        this.article().id,
        !this.article().save
      )
    );
    this.article.set({ ...this.article(), save: !this.article().save });
  }

  async onLinkClick(): Promise<void> {
    await this.markAsRead();
    await this.fetchLastReadAt();
  }

  private async markAsRead(): Promise<void> {
    await firstValueFrom(this.articleService.markAsRead(this.article().id));
  }

  private async fetchLastReadAt(): Promise<void> {
    const updatedArticle = await firstValueFrom(
      this.articleService.getById(this.article().id)
    );
    if (updatedArticle) {
      this.article.set({
        ...this.article(),
        lastReadAt: updatedArticle.lastReadAt,
      });
    }
  }
}
