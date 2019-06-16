import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';

import * as moment from 'moment';
import * as showdown from 'showdown';

import { StrapiService } from '../strapi.service';


@Component({
  selector: 'app-single-task',
  templateUrl: './single-task.component.html',
  styleUrls: ['./single-task.component.less']
})
export class SingleTaskComponent implements OnInit, OnChanges {

  @Input() task: any;
  @Input() open: boolean;
  @Output() toggle = new EventEmitter<any>();
  converter: showdown.Converter;
  content = '';

  constructor(public api: StrapiService) {
    this.converter = new showdown.Converter({
      customizedHeaderId: true,
      openLinksInNewWindow: true,
    });
  }

  ngOnInit() {
    this.content = this.converter.makeHtml(this.task.description);
    console.log('USER', this.task);
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

  requestToggle() {
    this.toggle.emit(this.task);
  }

  addUpdate(val: Event) {
    const content = val.currentTarget['value'];
    if (!content) {
      return;
    }
    const user = this.api.profile.getValue();
    if (!user || !user.id) {
      return;
    }
    this.api.addTaskUpdate({
      content: content,
      task: this.task.id,
      user: user.id
    }).subscribe((taskupdate) => {
      this.task.updates.push(taskupdate);
    });
  }

  ngOnChanges() {
    if (this.open) {
      this.api.getTask(this.task.id)
      .subscribe((task) => {
        this.task.updates = task.updates;
      });
    }
  }
}
