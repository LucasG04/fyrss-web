import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ConfigService } from './core/services/config-service';
import { ThemeToggle } from './shared/components/theme-toggle/theme-toggle';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ThemeToggle],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly platformId = inject(PLATFORM_ID);

  isMenuOpen = signal(false);
  configLoaded = signal(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      inject(ConfigService)
        .load()
        .then(() => this.configLoaded.set(true));
    }
  }

  toggleMenu() {
    this.isMenuOpen.update((open) => !open);
  }
}
