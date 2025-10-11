import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RssFeeds } from './rss-feeds';

describe('RssFeeds', () => {
  let component: RssFeeds;
  let fixture: ComponentFixture<RssFeeds>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RssFeeds]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RssFeeds);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
