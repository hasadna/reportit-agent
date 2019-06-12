import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-org-card',
  templateUrl: './org-card.component.html',
  styleUrls: ['./org-card.component.less']
})
export class OrgCardComponent implements OnInit {

  constructor() { }

  @Input() card: any;
  inner = {};

  ngOnInit() {
    const c = this.card;
    this.inner = {
      title: c['Organization Name'],
      content: `
${c['Description']}

כתובת מייל: ${c['Email 1']} ${c['Email 2']}

[${c['website label 1']}](${c['webiste url 1']})
      `
    };
  }

}
