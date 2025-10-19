import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FeedLastReadService {
  private static readonly PREFIX = 'feed-last-read-';
  private readonly cache = new Map<string, number>();
  private initialized = false;

  /** Loads all stored timestamps lazily */
  private ensureInitialized(): void {
    if (this.initialized) {
      return;
    }
    this.initialized = true;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(FeedLastReadService.PREFIX)) {
        continue;
      }

      const feedId = key.substring(FeedLastReadService.PREFIX.length);
      const rawValue = localStorage.getItem(key);
      const timestamp = rawValue ? Number(rawValue) : undefined;

      if (timestamp) {
        this.cache.set(feedId, timestamp);
      }
    }
  }

  /** Sets the last-read timestamp for a feed */
  setLastRead(feedId: string, date: Date): void {
    if (!feedId) {
      return;
    }

    const timestamp = date.getTime();
    this.cache.set(feedId, timestamp);

    try {
      localStorage.setItem(
        FeedLastReadService.PREFIX + feedId,
        timestamp.toString()
      );
    } catch (err) {
      console.warn('Failed to write last-read timestamp:', err);
    }
  }

  /** Returns the last-read date if available */
  getLastRead(feedId: string): Date | undefined {
    if (!feedId) {
      return undefined;
    }
    this.ensureInitialized();

    const timestamp = this.cache.get(feedId);
    return timestamp ? new Date(timestamp) : undefined;
  }
}
