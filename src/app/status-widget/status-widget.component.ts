import { Component, OnInit, Input } from '@angular/core';
import { StrapiService } from '../strapi.service';

@Component({
  selector: 'app-status-widget',
  templateUrl: './status-widget.component.html',
  styleUrls: ['./status-widget.component.less']
})
export class StatusWidgetComponent implements OnInit {

  @Input() report: any;
  show = false;

  constructor(private api: StrapiService) { }

  ngOnInit() {
  }

  toggle(event: Event) {
    this.show = !this.show;
    event.preventDefault();
  }

  select(status) {
    this.report.status = status;
    this.show = false;
    this.api.updateReport(this.report)
      .subscribe((response) => {
        console.log('updated', response);
      });
  }

}
