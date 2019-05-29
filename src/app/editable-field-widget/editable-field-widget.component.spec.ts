import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditableFieldWidgetComponent } from './editable-field-widget.component';

describe('EditableFieldWidgetComponent', () => {
  let component: EditableFieldWidgetComponent;
  let fixture: ComponentFixture<EditableFieldWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditableFieldWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditableFieldWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
