import { Component, OnInit, Input, OnChanges, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

import * as moment from 'moment';
import * as showdown from 'showdown';

import { StrapiService } from '../strapi.service';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';


@Component({
  selector: 'app-single-task',
  templateUrl: './single-task.component.html',
  styleUrls: ['./single-task.component.less']
})
export class SingleTaskComponent implements OnInit, OnChanges {

  @Input() task: any;
  @Input() report: any;
  @Input() open: boolean;
  @Output() toggle = new EventEmitter<any>();

  @ViewChild('titleEditor') titleEditor: ElementRef;
  @ViewChild('descriptionEditor') descriptionEditor: ElementRef;

  _editTitle = false;
  _editDescription = false;
  converter: showdown.Converter;
  content = '';

  constructor(public api: StrapiService) {
    this.converter = new showdown.Converter({
      customizedHeaderId: true,
      openLinksInNewWindow: true,
    });
  }

  ngOnInit() {
    this.render();
  }

  render() {
    this.content = this.converter.makeHtml(this.task.description);
  }

  mark_complete(complete) {
    this.task.complete = complete;
    this.api.updateTask(this.task)
      .pipe(
        switchMap(() => {
          const tasks: any[] = this.report.tasks;
          if (complete && tasks.filter((t: any) => !t.complete).length === 0) {
              this.report.status = 'done';
          } else if (!complete && tasks.filter((t: any) => !t.complete).length === 1) {
            this.report.status = 'active';
          } else {
            return of(this.task);
          }
          return this.api.updateReport(this.report);
        })
      ).subscribe((task) => {
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

  set editTitle(edit) {
    if (!edit) {
      this.api.updateTask(this.task)
        .subscribe(() => {
          console.log('UPDATED!');
        });
    } else {
      setTimeout(() => {
        this.titleEditor.nativeElement.focus();
      }, 100);
    }
    this._editTitle = edit;
  }

  get editTitle() {
    return this._editTitle;
  }

  set editDescription(edit) {
    if (!edit) {
      this.api.updateTask(this.task)
        .subscribe(() => {
          this.render();
          console.log('UPDATED!');
        });
    } else {
      setTimeout(() => {
        this.descriptionEditor.nativeElement.focus();
      }, 100);
    }
    this._editDescription = edit;
  }

  get editDescription() {
    return this._editDescription;
  }
}
