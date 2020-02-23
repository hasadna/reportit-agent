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
      ['email'],
      'כתובת מייל',
      (x) => `[${x[0]}](mailto:${x[0]})`
    );
  }

  website() {
    return this.section(
      ['websiteLabel', 'websiteUrl'],
      'קישורים',
      (x) => `[${x[0]}](${x[1]})`
    );
  }

  phone() {
    return this.section(
      ['phoneNumber'],
      'קשר טלפוני',
      (x) => `[${x[0]}](tel:${x[1]})`
    );
  }

  fax() {
    return this.section(
      'fax',
      'פקס',
      (x) => x
    );
  }


  street_address() {
    return this.section(
      'mailAddress',
      'כתובת משלוח דואר',
      (x) => x
    );
  }

  phone_response_details() {
    return this.section(
      'phoneResponseDetails',
      null,
      (x) => x
    );
  }

  contacts() {
    return this.section(
      ['contactPerson'],
      'אנשי קשר',
      (x) => x
    );

  }

  ngOnInit() {
    const c = this.card;
    this.inner = {
      title: c['organizationName'],
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
