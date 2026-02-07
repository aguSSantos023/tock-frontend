import { TestBed } from '@angular/core/testing';

import { AuthUser } from './auth-user';

describe('AuthUser', () => {
  let service: AuthUser;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthUser);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
