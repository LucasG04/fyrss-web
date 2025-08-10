import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Config } from '../../shared/types/config';
import { firstValueFrom } from 'rxjs';
import { isPlatformServer } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);
  private _config?: Config;

  get config(): Config {
    if (!this._config) {
      throw new Error('Config not loaded');
    }
    return this._config;
  }

  async load(): Promise<void> {
    if (isPlatformServer(this.platformId)) {
      return;
    }
    await firstValueFrom(this.http.get<Config>('/config'))
      .then((config: Config) => (this._config = config))
      .catch((error) => {
        console.error('Failed to load config:', error);
        throw error;
      });
  }
}
