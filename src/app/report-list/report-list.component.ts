import { Component, OnInit, Input } from '@angular/core';

import * as moment from 'moment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-report-list',
  templateUrl: './report-list.component.html',
  styleUrls: ['./report-list.component.less']
})
export class ReportListComponent implements OnInit {

  @Input() reports: any[];
  moment = null;

  constructor(private router: Router) {
    moment.locale('he');
  }

  ngOnInit() {
  }

  humanize(x) {
    return moment(x).max().fromNow();
  }

  select(report) {
    this.router.navigate(['report', report.id]);
  }

}
