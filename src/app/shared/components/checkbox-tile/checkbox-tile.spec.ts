import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckboxTile } from './checkbox-tile';

describe('CheckboxTile', () => {
  let component: CheckboxTile;
  let fixture: ComponentFixture<CheckboxTile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckboxTile],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckboxTile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
