import { Component, inject, signal } from '@angular/core';
import { RssFeed } from '../../shared/types/rss-feed';
import { firstValueFrom } from 'rxjs';
import { RssFeedService } from '../../core/services/rss-feed-service';

@Component({
  selector: 'app-rss-feeds',
  imports: [],
  templateUrl: './rss-feeds.html',
  styleUrl: './rss-feeds.css',
})
export class RssFeeds {
  private readonly feedService = inject(RssFeedService);

  feeds = signal<RssFeed[]>([]);

  constructor() {
    firstValueFrom(this.feedService.getAll()).then((feeds) => {
      this.feeds.set(feeds);
    });
  }
}
