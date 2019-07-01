import { Injectable } from '@angular/core';
import { StrapiService } from './strapi.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InfoCardsService {

  public infoCards = new BehaviorSubject<any[]>([]);
  private infoCardMap = {};
  public allOrgs = [];
  public taskTemplates = {};

  constructor(private api: StrapiService) {
    api.getInfoCards().subscribe((cards) => {
      for (const card of cards) {
        this.infoCardMap['info:' + card.slug] = Object.assign(card, {_kind: 'infocard'});
      }
    });
    api.getOrgCards().subscribe((cards) => {
      for (const card of cards) {
        const orgCard = Object.assign(card, {_kind: 'org'});
        this.infoCardMap['org:' + card.slug] = orgCard;
        this.allOrgs.push(orgCard);
      }
    });
    api.getTaskTemplates().subscribe((templates) => {
      for (const template of templates) {
        this.taskTemplates[template.slug] = template;
      }
    });
  }

  clear() {
    this.infoCards.next([]);
  }

  appendCard(slug) {
    let card = this.infoCardMap['info:' + slug];
    if (!card) {
      card = this.infoCardMap['org:' + slug];
    }
    if (card) {
      this.appendCardValue(card);
    } else {
      throw new Error('Unknown card slug ' + slug);
    }
  }

  appendCardValue(card) {
    if (card) {
      this.infoCards.next(
        this.infoCards.getValue().concat([card])
      );
    }
  }

  _combineSlugs(s1, s2) {
    s1 = (s1 || '').split(',');
    s2 = (s2 || '').split(',');
    let joined: string[] = s1.concat(s2);
    joined = joined.filter((x) => x.length > 0);
    return joined.join(',');
  }

  _fillIn(message: string, ...contexts) {
    return message.replace(
      RegExp('({{([a-z_0-9A-Z ]+)}})', 'g'),
      (match, p1, p2) => {
        for (const context of contexts) {
          if (context[p2]) {
            return context[p2];
          }
        }
        return p2;
      }
    );
  }

  addTask(report, task_slug, context, related_slugs) {
    const task_template = this.taskTemplates[task_slug];
    if (task_template) {
      const newTask = {
        report: '' + report.id,
        title: this._fillIn(task_template.Title, report, context),
        description: this._fillIn(task_template.Description, report, context),
        complete: false,
        card_slugs: this._combineSlugs(related_slugs, task_template.infocard_slugs)
      };
      this.api.addTask(newTask)
        .subscribe((task) => {
          this.appendCardValue(Object.assign(task, {'_kind': 'task'}));
        });
    }
  }

  getOrg(org_slug) {
    return this.infoCardMap['org:' + org_slug];
  }
}
