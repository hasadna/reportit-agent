import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-task-card',
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.less']
})
export class TaskCardComponent implements OnInit {

  @Input() card: any;
  inner = {};

  ngOnInit() {
    const c = this.card;
    this.inner = {
      title: c.title,
      content: '',
    };
  }

}
