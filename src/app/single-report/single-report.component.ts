import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-single-report',
  templateUrl: './single-report.component.html',
  styleUrls: ['./single-report.component.less'],
  encapsulation: ViewEncapsulation.Native
})
export class SingleReportComponent implements OnInit {

  @Input() report;

  constructor() { }

  ngOnInit() {
  }

}
