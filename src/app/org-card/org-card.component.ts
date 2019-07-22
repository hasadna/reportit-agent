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

  section(prefixes, label, format) {
    let ret = '';
    if (Array.isArray(prefixes)) {
      for (let i = 1; i < 5; i++) {
        const values = prefixes.map((p) => this.card[p + i]);
        if (values.reduce((a, b) => a && b, true)) {
          const formatted = format(values);
          ret += `- ${formatted}\n`;
        }
      }
    } else {
      const value = this.card[prefixes];
      if (value) {
        ret = format(value) + '\n';
      }
    }
    if (ret && label) {
      ret = label + ':\n' + ret;
    }
    return ret;
  }

  email() {
    return this.section(
      ['Email '],
      'כתובת מייל',
      (x) => `[${x[0]}](mailto:${x[0]})`
    );
  }

  website() {
    return this.section(
      ['website label ', 'website url '],
      'קישורים',
      (x) => `[${x[0]}](${x[1]})`
    );
  }

  phone() {
    return this.section(
      ['Phone number '],
      'קשר טלפוני',
      (x) => `[${x[0]}](tel:${x[1]})`
    );
  }

  fax() {
    return this.section(
      'Fax',
      'פקס',
      (x) => x
    );
  }


  street_address() {
    return this.section(
      'Mail Address',
      'כתובת משלוח דואר',
      (x) => x
    );
  }

  phone_response_details() {
    return this.section(
      'Phone response details',
      null,
      (x) => x
    );
  }

  contacts() {
    return this.section(
      ['Contact Person '],
      'אנשי קשר',
      (x) => x
    );

  }

  ngOnInit() {
    const c = this.card;
    console.log('CARD', c);
    this.inner = {
      title: c['Organization Name'],
      content: `
${c['Description'] || ''}

${this.email()}
${this.website()}
${this.contacts()}
${this.phone()}
${this.phone_response_details()}
${this.fax()}
${this.street_address()}
`
    };
  }

}
