import { TestBed } from '@angular/core/testing';

import { StrapiService } from './strapi.service';

describe('StrapiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StrapiService = TestBed.get(StrapiService);
    expect(service).toBeTruthy();
  });
});
