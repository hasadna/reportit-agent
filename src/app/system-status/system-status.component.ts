import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-system-status',
  templateUrl: './system-status.component.html',
  styleUrls: ['./system-status.component.less']
})
export class SystemStatusComponent implements OnInit, OnChanges {

  @Input() reports: any[];
  @Output() filtering = new EventEmitter<any>();
  count_total = 0;
  count_new = 0;
  count_active = 0;
  count_done = 0;
  filter = 'none';

  constructor() { }

  ngOnInit() {
    this.ngOnChanges();
    this.setFilter(this.filter);
  }

  setFilter(value) {
    if (this.filter === value) {
      this.filter = 'none';
    } else {
      this.filter = value;
    }
    this.filtering.emit(this.filter);
  }

  ngOnChanges() {
    this.count_total = this.reports.length;
    this.count_active = this.count_done = this.count_new = 0;
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
