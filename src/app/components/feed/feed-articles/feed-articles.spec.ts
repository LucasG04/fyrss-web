import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedArticles } from './feed-articles';

describe('FeedArticles', () => {
  let component: FeedArticles;
  let fixture: ComponentFixture<FeedArticles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedArticles]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeedArticles);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
