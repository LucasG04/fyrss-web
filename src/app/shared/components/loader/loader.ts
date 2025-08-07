import { Component } from '@angular/core';

@Component({
  selector: 'app-loader',
  imports: [],
  template: `<div class="loader">
    <svg viewBox="0 0 80 80">
      <circle r="32" cy="40" cx="40"></circle>
    </svg>
  </div>`,
  styleUrl: './loader.css',
})
export class Loader {}
