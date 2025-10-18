import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FeedLastReadService {
  private lastReadTimestamps: Map<string, number> = new Map();

  setLastRead(feedId: string, timestamp: number): void {
    this.lastReadTimestamps.set(feedId, timestamp);
    localStorage.setItem(`feed-last-read-${feedId}`, timestamp.toString());
  }

  getLastRead(feedId: string): number | null {
    return this.lastReadTimestamps.get(feedId) || null;
  }
}
