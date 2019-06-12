import { TestBed } from '@angular/core/testing';

import { InfoCardsService } from './info-cards.service';

describe('InfoCardsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: InfoCardsService = TestBed.get(InfoCardsService);
    expect(service).toBeTruthy();
  });
});
