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
  open = null;

  close_report_explanation = '';
  close_report_modal_active = false;

  constructor(private infoCards: InfoCardsService, private api: StrapiService) { }

  ngOnInit() {
    this.infoCards.clear();
  }

  toggle(task) {
    this.infoCards.clear();
    if (this.open === task) {
      this.open = null;
    } else {
      this.open = task;
      for (const card of task.card_slugs.split(',')) {
        if (card) {
          this.infoCards.appendCard(card);
        }
      }
    }
  }

  newTask() {
    this.infoCards.addTask(this.report, 'new_task', {}, '');
  }

  returnToChat() {
    const report = Object.assign(this.report, {finished_intake: false});
    this.api.updateReport(report)
      .subscribe((res) => {
        Object.assign(this.report, res);
      });
  }

  closeReport() {
    if (this.close_report_explanation) {
      this.infoCards.addClosingTask(this.report, this.close_report_explanation);
      this.close_report_modal_active = false;
    }
  }
}
