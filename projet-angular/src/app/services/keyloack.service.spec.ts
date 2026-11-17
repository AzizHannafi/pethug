import { TestBed } from '@angular/core/testing';

import { KeyloackService } from './keycloack.service';

describe('KeyloackService', () => {
  let service: KeyloackService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KeyloackService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
