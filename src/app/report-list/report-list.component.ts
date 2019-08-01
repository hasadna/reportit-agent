import { Component, OnInit, Input, OnChanges } from '@angular/core';

import * as moment from 'moment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-report-list',
  templateUrl: './report-list.component.html',
  styleUrls: ['./report-list.component.less']
})
export class ReportListComponent implements OnInit, OnChanges {

  @Input() reports: any[];
  @Input() filtering: string;
  visibleReports: any[];
  moment = null;

  constructor(private router: Router) {
    moment.locale('he');
  }

  ngOnInit() {
  }

  ngOnChanges() {
    console.log('reports', this.filtering, this.reports)
    this.visibleReports = this.reports.filter(
      (r) => this.filtering === 'none' || r.status === this.filtering
    );
  }

  humanize(x) {
    return moment.min(moment(), moment(x)).fromNow();
  }

  select(report) {
    this.router.navigate(['report', report.id]);
  }

}
