import { TestBed } from '@angular/core/testing';

import { FeedLastReadService } from './feed-last-read-service';

describe('FeedLastReadService', () => {
  let service: FeedLastReadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FeedLastReadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
