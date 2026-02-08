import { TestBed } from '@angular/core/testing';

import { SongManager } from './song-manager';

describe('SongManager', () => {
  let service: SongManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SongManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
