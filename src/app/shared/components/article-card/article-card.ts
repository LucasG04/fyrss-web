import { Component, computed, input, output } from '@angular/core';
import { Article } from '../../types/article';

@Component({
  selector: 'app-article-card',
  imports: [],
  templateUrl: './article-card.html',
  styleUrl: './article-card.css',
})
export class ArticleCard {
  article = input.required<Article>();

  onSaveChange = output<boolean>();
  onLinkOpen = output<void>();

  sourceUrlShort = computed<string>(() => {
    const urlString = this.article().sourceUrl;
    if (!urlString) return '';

    const url = new URL(urlString);
    if (!url.hostname) {
      return urlString.length > 30 ? `${urlString.slice(0, 27)}...` : urlString;
    }

    const host = url.hostname.replace('www.', '');
    const path =
      url.pathname.length > 30
        ? `${url.pathname.slice(0, 27)}...`
        : url.pathname;
    return `${host}${path}`;
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
}
