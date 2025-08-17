import { inject, Injectable } from '@angular/core';
import { Tag } from '../../shared/types/tag';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config-service';

@Injectable({
  providedIn: 'root',
})
export class TagService {
  private readonly configService = inject(ConfigService);
  private readonly http = inject(HttpClient);
  private readonly apiUrl = this.configService.config.apiUrl;

  getAll(): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.apiUrl}/tags`);
  }

  update(tag: Tag): Observable<Tag> {
    return this.http.put<Tag>(`${this.apiUrl}/tags`, tag);
  }
}
