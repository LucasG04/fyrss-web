import {
  Component,
  inject,
  computed,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ThemeService } from '../../../core/services/theme-service';

@Component({
  selector: 'app-theme-toggle',
  imports: [],
  template: `
    <button
      (click)="toggleTheme()"
      class="relative p-2 rounded-lg bg-card bg-card-hover text-soft text-main-hover transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
      [attr.aria-label]="ariaLabel()"
      title="Toggle theme"
    >
      <!-- System mode icon (monitor) -->
      <i
        class="eva text-xl transition-all duration-500 ease-in-out"
        [class]="systemIcon()"
        [class.opacity-100]="themeService.mode() === 'system'"
        [class.opacity-0]="themeService.mode() !== 'system'"
        [class.rotate-0]="themeService.mode() === 'system'"
        [class.rotate-180]="themeService.mode() !== 'system'"
        [class.scale-100]="themeService.mode() === 'system'"
        [class.scale-0]="themeService.mode() !== 'system'"
      ></i>

      <!-- Light mode icon (sun) -->
      <i
        class="eva eva-sun-outline text-xl absolute inset-2 transition-all duration-500 ease-in-out"
        [class.opacity-100]="themeService.mode() === 'light'"
        [class.opacity-0]="themeService.mode() !== 'light'"
        [class.rotate-0]="themeService.mode() === 'light'"
        [class.rotate-180]="themeService.mode() !== 'light'"
        [class.scale-100]="themeService.mode() === 'light'"
        [class.scale-0]="themeService.mode() !== 'light'"
      ></i>

      <!-- Dark mode icon (moon) -->
      <i
        class="eva eva-moon-outline text-xl absolute inset-2 transition-all duration-500 ease-in-out"
        [class.opacity-100]="themeService.mode() === 'dark'"
        [class.opacity-0]="themeService.mode() !== 'dark'"
        [class.rotate-0]="themeService.mode() === 'dark'"
        [class.-rotate-180]="themeService.mode() !== 'dark'"
        [class.scale-100]="themeService.mode() === 'dark'"
        [class.scale-0]="themeService.mode() !== 'dark'"
      ></i>
    </button>
  `,
  styles: [
    `
      button {
        min-width: 40px;
        min-height: 40px;
      }

      i {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `,
  ],
})
export class ThemeToggle {
  private readonly platformId = inject(PLATFORM_ID);
  protected readonly themeService = inject(ThemeService);

  systemIcon = signal<string>('');

  ariaLabel = computed<string>(() => {
    const mode = this.themeService.mode();
    const isDark = this.themeService.effectiveDark();

    switch (mode) {
      case 'light':
        return 'Switch to dark theme';
      case 'dark':
        return 'Switch to system theme';
      case 'system':
        return isDark
          ? 'Switch to light theme (currently following system: dark)'
          : 'Switch to light theme (currently following system: light)';
      default:
        return 'Toggle theme';
    }
  });

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const isMobile = window.matchMedia('(max-width: 640px)').matches;
      this.systemIcon.set(
        isMobile ? 'eva-smartphone-outline' : 'eva-monitor-outline'
      );
    }
  }

  toggleTheme(): void {
    const currentMode = this.themeService.mode();

    // Cycle through: system, light, dark
    switch (currentMode) {
      case 'system':
        this.themeService.setMode('light');
        break;
      case 'light':
        this.themeService.setMode('dark');
        break;
      case 'dark':
        this.themeService.setMode('system');
        break;
    }
  }
}
