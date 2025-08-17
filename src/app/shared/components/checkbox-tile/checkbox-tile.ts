import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-checkbox-tile',
  imports: [],
  templateUrl: './checkbox-tile.html',
  styleUrl: './checkbox-tile.css',
})
export class CheckboxTile {
  label = input.required<string>();
  checked = input.required<boolean>();
  onChange = output<boolean>();
}
