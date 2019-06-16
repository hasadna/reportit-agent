import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleTaskUpdateComponent } from './single-task-update.component';

describe('SingleTaskUpdateComponent', () => {
  let component: SingleTaskUpdateComponent;
  let fixture: ComponentFixture<SingleTaskUpdateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SingleTaskUpdateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleTaskUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
