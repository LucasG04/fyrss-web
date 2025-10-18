import { Component, input } from '@angular/core';

@Component({
  selector: 'app-pulse-indicator',
  imports: [],
  templateUrl: './pulse-indicator.html',
  styleUrl: './pulse-indicator.css',
})
export class PulseIndicator {
  isActive = input.required<boolean>();
  ariaLabel = input<string>('New');
}
