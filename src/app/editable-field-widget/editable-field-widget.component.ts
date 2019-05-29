import { Component, OnInit, Input, HostListener, ViewChild, ElementRef } from '@angular/core';
import { StrapiService } from '../strapi.service';

@Component({
  selector: 'app-editable-field-widget',
  templateUrl: './editable-field-widget.component.html',
  styleUrls: ['./editable-field-widget.component.less']
})
export class EditableFieldWidgetComponent implements OnInit {

  @Input() report: any;
  @Input() field: string;
  @Input() oneLine = false;
  @Input() text = false;
  @ViewChild('textInput') textInput: ElementRef;
  @ViewChild('textArea') textArea: ElementRef;

  active = false;

  constructor(private api: StrapiService) { }

  ngOnInit() {

  }

  @HostListener('document:click', ['$event'])
  onClickOutOfEdit(event: any) {
    const isClickedOnEdit =
        (this.textArea && this.textArea.nativeElement && this.textArea.nativeElement.contains(event.target)) ||
        (this.textInput && this.textInput.nativeElement && this.textInput.nativeElement.contains(event.target));

    if (this.active && !isClickedOnEdit) {
      this.active = false;
      this.api.updateReport(this.report)
          .subscribe((response) => {
            Object.assign(this.report, response);
          });
    }
  }

  edit() {
    if (!this.active) {
      window.setTimeout(() => {
        this.active = true;
      }, 0);
    }
  }


}
