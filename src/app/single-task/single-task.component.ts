import { Component, OnInit, Input, OnChanges } from '@angular/core';

import * as moment from 'moment';
import * as showdown from 'showdown';
import { StrapiService } from '../strapi.service';
import { InfoCardsService } from '../info-cards.service';

@Component({
  selector: 'app-single-task',
  templateUrl: './single-task.component.html',
  styleUrls: ['./single-task.component.less']
})
export class SingleTaskComponent implements OnInit {

  @Input() task: any;
  converter: showdown.Converter;
  content = '';

  constructor(private api: StrapiService, private infocards: InfoCardsService) {
    this.converter = new showdown.Converter({
      customizedHeaderId: true,
      openLinksInNewWindow: true,
    });
  }

  ngOnInit() {
    this.content = this.converter.makeHtml(this.task.description);
  }

  changed() {
    this.api.updateTask(this.task)
      .subscribe((task) => {
        console.log('updated!');
      });
  }

  humanize(x) {
    return moment.min(moment(), moment(x)).fromNow();
  }

  setCards() {
    this.infocards.clear();
    for (const card of this.task.card_slugs.split(',')) {
      console.log(card);
      this.infocards.appendCard(card);
    }
  }
}
