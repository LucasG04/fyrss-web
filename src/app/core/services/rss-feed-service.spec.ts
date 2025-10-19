import { TestBed } from '@angular/core/testing';
import { RssFeedService } from './rss-feed-service';

describe('FeedService', () => {
  let service: RssFeedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RssFeedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
