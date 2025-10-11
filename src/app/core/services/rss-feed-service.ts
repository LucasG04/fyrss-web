import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfigService } from './config-service';
import { RssFeed } from '../../shared/types/rss-feed';

@Injectable({
  providedIn: 'root',
})
export class RssFeedService {
  private readonly configService = inject(ConfigService);
  private readonly http = inject(HttpClient);
  private readonly apiUrl = this.configService.config.apiUrl;

  getAll(): Observable<RssFeed[]> {
    return this.http.get<RssFeed[]>(`${this.apiUrl}/feeds`);
  }

  getById(id: string): Observable<RssFeed> {
    return this.http.get<RssFeed>(`${this.apiUrl}/feeds/${id}`);
  }

  create(feed: Omit<RssFeed, 'id'>): Observable<RssFeed> {
    return this.http.post<RssFeed>(`${this.apiUrl}/feeds`, feed);
  }

  update(feed: RssFeed): Observable<RssFeed> {
    return this.http.put<RssFeed>(`${this.apiUrl}/feeds/${feed.id}`, feed);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/feeds/${id}`);
  }
}
