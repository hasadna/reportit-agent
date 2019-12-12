import { Injectable, LOCALE_ID, Inject } from '@angular/core';
import { StrapiService } from './strapi.service';
import { BehaviorSubject, of, Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class InfoCardsService {

  public infoCards = new BehaviorSubject<any[]>([]);
  private infoCardMap = {};
  public allOrgs = [];
  public taskTemplates = {};

  constructor(private http: HttpClient,
              private api: StrapiService,
              @Inject(LOCALE_ID) private locale) {
    this.getInfoCards().subscribe((cards) => {
      for (const card of cards) {
        this.infoCardMap['info:' + card.slug] = Object.assign(card, {_kind: 'infocard'});
      }
    });
    this.getOrgCards().subscribe((cards) => {
      for (const card of cards) {
        const orgCard = Object.assign(card, {_kind: 'org'});
        this.infoCardMap['org:' + card.slug] = orgCard;
        this.allOrgs.push(orgCard);
      }
    });
    this.getTaskTemplates().subscribe((templates) => {
      for (const template of templates) {
        this.taskTemplates[template.slug] = template;
      }
    });
  }

  getDataset(kind): Observable<any[]> {
    return this.http.get(`https://raw.githubusercontent.com/hasadna/reportit-scripts/master/src/datasets/${kind}.datapackage.tx.json`)
      .pipe(
        map((datapackage: any) => {
          const ret = [];
          for (const item of datapackage.resources[0].data) {
            const translated = {};
            for (const k of Object.keys(item)) {
              translated[k] = (item['.tx'] ? item['.tx'][this.locale] || item['.tx']['he'] : null) || item[k];
            }
            ret.push(translated);
          }
          return ret;
        })
      );
  }

  getInfoCards(): Observable<any[]> {
    return this.getDataset('infocards');
  }

  getOrgCards(): Observable<any[]> {
    return this.getDataset('organizations');
  }

  getTaskTemplates(): Observable<any[]> {
    return this.getDataset('tasktemplates');
  }

  clear() {
    this.infoCards.next([]);
  }

  appendCard(slug) {
    let card = this.infoCardMap[slug];
    if (!card) {
      card = this.infoCardMap['info:' + slug];
    }
    if (!card) {
      card = this.infoCardMap['org:' + slug];
    }
    if (card) {
      this.appendCardValue(card);
    } else {
      console.log('Unknown card slug ' + slug);
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
    const task_title = this._fillIn(task_template.Title, report, context);
    for (const task of report.tasks) {
      if (task.title === task_title) {
        console.log('Not creating duplication of already existing task', task_title);
        return;
      }
    }
    if (task_template) {
      const newTask = {
        report: '' + report.id,
        title: task_title,
        description: this._fillIn(task_template.Description, report, context),
        complete: false,
        card_slugs: this._combineSlugs(related_slugs, task_template.infocard_slugs)
      };
      report._num_tasks = report.tasks.length + 1;
      this.api.addTask(newTask)
        .pipe(
          switchMap((task) => {
            this.appendCardValue(Object.assign(task, {'_kind': 'task'}));
            return this.api.getReport(report.id);
          }),
          switchMap((new_report) => {
            console.log('Setting report status to active!');
            new_report.status = 'active';
            return this.api.updateReport(new_report);
          })
        )
        .subscribe((new_report) => {
          Object.assign(report, new_report);
          report._num_tasks = report.tasks.length;
        });
    }
  }

  getOrg(org_slug) {
    return this.infoCardMap['org:' + org_slug];
  }
}
