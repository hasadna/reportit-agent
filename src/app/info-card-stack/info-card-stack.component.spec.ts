import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoCardStackComponent } from './info-card-stack.component';

describe('InfoCardStackComponent', () => {
  let component: InfoCardStackComponent;
  let fixture: ComponentFixture<InfoCardStackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoCardStackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoCardStackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
