import { Component, OnInit, Input } from '@angular/core';

import * as showdown from 'showdown';


@Component({
  selector: 'app-info-card',
  templateUrl: './info-card.component.html',
  styleUrls: ['./info-card.component.less']
})
export class InfoCardComponent implements OnInit {

  @Input() card: any;
  converter: showdown.Converter;
  content = '';

  constructor() {
    this.converter = new showdown.Converter({
      customizedHeaderId: true,
      openLinksInNewWindow: true,
    });
  }

  ngOnInit() {
    this.content = this.converter.makeHtml(this.card.content);
  }

}
