import { Component, OnInit, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-system-status',
  templateUrl: './system-status.component.html',
  styleUrls: ['./system-status.component.less']
})
export class SystemStatusComponent implements OnInit, OnChanges {

  @Input() reports: any[];
  count_total = 0;
  count_new = 0;
  count_active = 0;
  count_done = 0;

  constructor() { }

  ngOnInit() {
    this.ngOnChanges();
  }

  ngOnChanges() {
    this.count_total = this.reports.length;
    for (const report of this.reports) {
      if (report.status === 'active') {
        this.count_active += 1;
      } else if (report.status === 'done') {
        this.count_done += 1;
      } else {
        this.count_new += 1;
      }
    }
  }

}
