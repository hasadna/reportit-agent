import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import * as moment from 'moment';

@Component({
  selector: 'app-report-edit',
  templateUrl: './report-edit.component.html',
  styleUrls: ['./report-edit.component.less']
})
export class ReportEditComponent implements OnInit {

  @Input() report: any;

  constructor(private router: Router) {
    moment.locale('he');
  }

  ngOnInit() {
  }

  back() {
    this.router.navigate(['']);
  }

  humanize(x) {
    return moment.min(moment(), moment(x)).fromNow();
  }

}
