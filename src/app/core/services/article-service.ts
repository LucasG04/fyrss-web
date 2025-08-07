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

  getFeed(from: number, to: number): Observable<Article[]> {
    const apiUrl = this.configService.config.apiUrl;
    return this.http.get<Article[]>(
      `${apiUrl}/articles/feed?from=${from}&to=${to}`
    );
  }

  getHistory(from: number, to: number): Observable<Article[]> {
    const apiUrl = this.configService.config.apiUrl;
    return this.http.get<Article[]>(
      `${apiUrl}/articles/history?from=${from}&to=${to}`
    );
  }

  getSaved(from: number, to: number): Observable<Article[]> {
    const apiUrl = this.configService.config.apiUrl;
    return this.http.get<Article[]>(
      `${apiUrl}/articles/saved?from=${from}&to=${to}`
    );
  }

  markAsRead(articleId: string): Observable<void> {
    const apiUrl = this.configService.config.apiUrl;
    return this.http.patch<void>(`${apiUrl}/articles/${articleId}/read`, null);
  }

  updateArticleSaved(articleId: string, save: boolean): Observable<void> {
    const apiUrl = this.configService.config.apiUrl;
    return this.http.patch<void>(
      `${apiUrl}/articles/${articleId}/saved?saved=${save}`,
      null
    );
  }
}
