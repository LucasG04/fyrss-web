import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ConfigService } from './config-service';
import { Article } from '../../shared/types/article';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ArticleService {
  private readonly configService = inject(ConfigService);
  private readonly http = inject(HttpClient);
  private readonly apiUrl = this.configService.config.apiUrl;

  getFeed(from: number, to: number): Observable<Article[]> {
    return this.http.get<Article[]>(
      `${this.apiUrl}/articles/feed?from=${from}&to=${to}`
    );
  }

  getHistory(from: number, to: number): Observable<Article[]> {
    return this.http.get<Article[]>(
      `${this.apiUrl}/articles/history?from=${from}&to=${to}`
    );
  }

  getSaved(from: number, to: number): Observable<Article[]> {
    return this.http.get<Article[]>(
      `${this.apiUrl}/articles/saved?from=${from}&to=${to}`
    );
  }

  markAsRead(articleId: string): Observable<void> {
    return this.http.patch<void>(
      `${this.apiUrl}/articles/${articleId}/read`,
      null
    );
  }

  updateArticleSaved(articleId: string, save: boolean): Observable<void> {
    return this.http.patch<void>(
      `${this.apiUrl}/articles/${articleId}/saved?saved=${save}`,
      null
    );
  }
}
