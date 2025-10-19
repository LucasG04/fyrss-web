import { Injectable } from '@angular/core';

export interface ScrollPosition {
  x: number;
  y: number;
}

@Injectable({
  providedIn: 'root',
})
export class ScrollPositionService {
  private readonly scrollPositions = new Map<string, ScrollPosition>();

  saveScrollPosition(key: string): void {
    const scrollPosition: ScrollPosition = {
      x: window.scrollX || window.pageXOffset,
      y: window.scrollY || window.pageYOffset,
    };

    this.scrollPositions.set(key, scrollPosition);
  }

  getScrollPosition(key: string): ScrollPosition | undefined {
    return this.scrollPositions.get(key);
  }

  restoreScrollPosition(key: string): boolean {
    const position = this.getScrollPosition(key);

    if (!position) {
      return false;
    }

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      window.scrollTo({
        left: position.x,
        top: position.y,
        behavior: 'auto',
      });
    });

    return true;
  }
}
