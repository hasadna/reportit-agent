import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleReportComponent } from './single-report.component';

describe('SingleReportComponent', () => {
  let component: SingleReportComponent;
  let fixture: ComponentFixture<SingleReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SingleReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
