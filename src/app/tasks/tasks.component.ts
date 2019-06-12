import { Component, OnInit, Input } from '@angular/core';
import { InfoCardsService } from '../info-cards.service';
import { StrapiService } from '../strapi.service';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.less']
})
export class TasksComponent implements OnInit {

  @Input() report: any;

  constructor(private infoCards: InfoCardsService, private api: StrapiService) { }

  ngOnInit() {
    this.infoCards.clear();
  }

  restart() {
    this.api.updateReport(Object.assign({}, this.report, {finished_intake: false}))
      .subscribe((report) => {
        console.log('restarted');
        this.report = Object.assign(this.report, report);
      });
  }
}
