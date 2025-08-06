import { Component, computed, input } from '@angular/core';
import { Article } from '../../../shared/types/article';

@Component({
  selector: 'app-feed-card',
  imports: [],
  templateUrl: './feed-card.html',
  styleUrl: './feed-card.css',
})
export class FeedCard {
  article = input.required<Article>();

  sourceUrlShort = computed<string>(() => {
    const url = this.article().sourceUrl;
    if (!url) return '';

    return url.length > 30 ? `${url.slice(0, 27)}...` : url;
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
