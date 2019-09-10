import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ContentManager, FileUploader, ScriptRunnerNew as ScriptRunnerImpl } from 'hatool';
import { switchMap } from 'rxjs/operators';
import { StrapiService } from '../strapi.service';
import { InfoCardsService } from '../info-cards.service';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-chatbox',
  templateUrl: './chatbox.component.html',
  styleUrls: ['./chatbox.component.less']
})
export class ChatboxComponent implements OnInit, OnDestroy {

  @Input() report: any;
  subscription: Subscription = null;
  content: ContentManager;
  runner: ScriptRunnerImpl;

  constructor(private api: StrapiService,
              private infocards: InfoCardsService,
              private http: HttpClient,
  ) {
    this.init();
  }

  init() {
    this.content = new ContentManager();
    this.runner = new ScriptRunnerImpl(this.http, this.content);
    this.runner.debug = false;
    console.log('CHAT INIT!!');
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    const report = Object.assign({}, this.report, {saved_state: this.runner.state});
    this.api
      .updateReport(report)
      .subscribe((ret) => {
        Object.assign(this.report, ret);
      });
  }

  matchScenarios(record, scenarios) {
    console.log('MATCH SCENARIOS', record, scenarios);
    if (!record || !scenarios) {
      return false;
    }
    scenarios = scenarios.scenarios || [];
    for (const scenario of scenarios) {
      let matchingScenario = true;
      console.log('> SCENARIO', scenario);
      for (const [field, value] of Object.entries(scenario)) {
        let values = [];
        if (!Array.isArray(value)) {
          values = [value];
        } else {
          values = value;
        }
        const expected = record[field];
        console.log('> > ', field, expected, values);
        let foundExpected = false;
        for (const option of values) {
          if (option === expected) {
            foundExpected = true;
            break;
          }
        }
        if (!foundExpected) {
          matchingScenario = false;
          break;
        }
      }
      if (matchingScenario) {
        return true;
      }
    }
    return false;
  }

  ngOnInit() {
    this.content.sendButtonText = '';
    this.content.uploadFileText = 'לחצ/י לבחירת קובץ';
    this.content.uploadedFileText = 'קובץ הועלה בהצלחה';
    this.content.notUploadedFileText = 'תקלה בהעלאת קובץ';
    this.content.inputPlaceholder = 'הקלידו הודעה...';

    this.infocards.clear();
    this.runner.state = this.report.saved_state || {};
    console.log('STATE:', this.runner.state);

    this.report._num_tasks = this.report.tasks.length;

    this.subscription = this.runner.run(
      'https://raw.githubusercontent.com/hasadna/reportit-scripts/master/src/agent/script.json',
      0,
      {
        /// Specific Utils
        getOffender: async (record) => {
          console.log('OFFENDER', record.offender);
          return record.offender;
        },
        getOffenderOrganizationCategory: async (record) => {
          return record.offender_organization_category;
        },
        getComplaintType: async (record) => {
          return record.complaint_type;
        },
        checkOnlyEmail: async (record) => {
          return record.email && !record.phone && !record.whatsapp && !record.facebook;
        },
        combinedPoliceEventDescription: async (record) => {
          let new_description = record.event_description + `\n \n פרטים נוספים, משיחה עם המוקדנ/ית: \n`;
          if (record._police_more_details !== 'false') {
            new_description += `${record._police_more_details}\n`;
          }
          new_description += `${record._police_arrest} \n`;
          new_description += `${record._police_court} \n`;
          new_description += `${record._police_has_lawyer} \n`;
          if (typeof record._police_witness_details !== undefined) {
            new_description += `${record._police_witness_details}`;
          } else {
            new_description += `אין פרטים של עדי ראייה`;
          }
          return new_description;
        },
        addMunicipalReaction: async (record) => {
              const new_description = `${record.event_description} \n\n\
                                פרטי הפניה ותגובת הרשות המקומית, כפי שתוארו בשיחה עם המוקדנ/ית: \n\
                                ${record._details_to_add_to_description}`;
              return new_description;
        },
        combinedEventDescription: async (record) => {
          let new_description = record.event_description;
          if (record._add_details_to_description === 'true') {
            new_description += `\n\n פרטים נוספים, משיחה עם המוקדנ/ית: \n${record._details_to_add_to_description}\n`;
            record._details_to_add_to_description = undefined;
          }
          if (record._ask_for_witness_details === 'true') {
            new_description += `\n עדים או אנשים שיוכלו לאמת את הפרטים: \n${record._witness_details}`;
          } else {
            new_description += `\nאין פרטים של עדי ראייה`;
          }
          return new_description;
        },
        checkOfficeRepresetativeRelevancy: async (record) => {
          const location = record.event_location;

          if (location === 'משרד ממשלתי' || location === 'תחבורה ציבורית' || location === 'בית חולים') {
            this.content.addTo('אם האירוע\
             המפלה התרחש בתחומי רשות ציבורית\
            (בית חולים, משרד ממשלתי, תחבורה ציבורית)\
           כדאי בכל מקרה להגיש תלונה\
            לממונה על טיפול בתלונות בנושא גזענות במשרד הרלוונטי');
           this.infocards.appendCard('office_preventing_racism');
           this.content.addOptions('בדקו האם ישנו ממונה במשרד הרלוונטי:', [
                { display: 'כן', value: () => { this.infocards.addTask(record,
                                                                       'share_with_office_fight_racism_contact',
                                                                       {},
                                                                        '');
                                              }
                                            },
                { display: 'לא', value: () => {} },
              ]);
              (await this.content.waitForInput())();
          }
        },
        checkSpecificGuardComplain: async (record) => {
          if (record.offender === 'מאבטח/ת') {
            if (record.Offender_person_details !== undefined) {
              this.content.addTo('הסבירו לפונה שמכיוון שמסר פרטים מזהים לגבי המאבטח, יש באפשרותו להגיש תלונה כנגדם\
                                  למחלקת האבטחה והרישוי במשטרת ישראל.');
              this.infocards.appendCard('police_security_department');
              this.content.addOptions('האם הפונה מעוניינ/ת לקבל סיוע בפנייה למחלקת האבטחה והרישוי במשטרה והגשת תלונה על המאבטח?', [
                   { display: 'כן', value: () => { this.infocards.addTask(record,
                                                                          'compaint_guard_to_police',
                                                                          {},
                                                                           '');
                                                 }
                                               },
                   { display: 'לא', value: () => {} },
                 ]);
                 (await this.content.waitForInput())();
               }}},
        countFiles: async (record) => {
          return record.evidence_files.length;
        },
        selectGovOrgs: async (record) => {
          for (const org of this.infocards.allOrgs) {
            console.log('select Gov org:', org);
            if (org['Organization Type'] === 'יחידה ממשלתית') {
              if (!this.matchScenarios(record, org.scenarios)) {
                continue;
              }
              this.content.addTo(`האם הפונה מעוניינ/ת לשתף את המקרה עם ${org['Organization Name']}?`,
                                 () => { this.infocards.appendCard('org:' + org.slug); });
              this.content.addOptions(null, [
                { display: 'כן', value: () => { this.infocards.addTask(record, 'send_report_to_governmental_unit', org, 'org:' + org.slug);
                                              }
                                            },
                { display: 'לא', value: () => {} },
              ]);
              (await this.content.waitForInput())();
            }
          }
        },
        selectNGO: async (record) => {
          for (const org of this.infocards.allOrgs) {
            console.log('selectNGO org:', org);
            if (org['Organization Type'] === 'ארגון חברה אזרחית') {
              if (!this.matchScenarios(record, org.scenarios)) {
                continue;
              }
              this.content.addTo(`האם הפונה מעוניינ/ת לשתף את המקרה עם ${org['Organization Name']}?`,
                                 () => { this.infocards.appendCard('org:' + org.slug); });
              this.content.addOptions(null, [
                { display: 'כן', value: () => { this.infocards.addTask(record, 'send_to_ngo', org, 'org:' + org.slug); }
                },
               { display: 'מאשר/ת להעביר את תיאור המקרה, ללא פרטים מזהים',
                 value: () => { this.infocards.addTask(record, 'org_send_anonymously', org, 'org:' + org.slug); }
                },
                { display: 'לא',
                  value: () => {}
                }
              ]);
              (await this.content.waitForInput())();
            }
          }
        },
        getTaskCount: async (record) => {
          return record.tasks._num_tasks;
        },
        restartConversation: async () => {
          this.restart();
        },
        addTask: async (record, task, org?, slugs?) => {
          let context = {};
          slugs = slugs || '';
          if (org) {
            context = this.infocards.getOrg(org);
            if (context) {
              if (slugs.length) {
                slugs += ',';
              }
              slugs += 'org:' + org;
            } else {
              context = {};
            }
          }
          this.infocards.addTask(record, task, context, slugs);
        },
        showInfoCard: async (card) => {
          this.infocards.appendCard(card);
        },
        print: async (record, field) => {
          console.log(`value of record[${field}] is`, record[field]);
        },
        /// Generic Utils
        uploader: async (record, key, uploader: FileUploader) => {
          uploader.active = true;
          const uploaded = this.api.uploadFile(
            record.id,
            uploader.selectedFile, record.id + '/' + key,
              (progress) => { uploader.progress = progress; },
              (success) => { uploader.success = success; }
          );
          return uploaded.then((report: any) => {
            console.log('NEW RECORD', report);
            record.evidence_files = report.evidence_files;
          });
          // return uploaded;
        },
      },
      async (key, value, record) => {
        this.api.updateReport(record)
          .subscribe(() => { console.log('SAVED!'); }, () => {});
      },
      this.report
    ).pipe(
      switchMap((retval) => {
        if (retval === this.runner.COMPLETE) {
          this.content.addOptions(null, [
            {value: true, display: 'לחצו לסיום השיחה והצגת רשימת המשימות'},
          ]);
        } else {
          this.content.addOptions(null, [
            {value: true, display: 'השיחה הופסקה אולם תוכלו לחזור אליה בהמשך - לחצו להצגת רשימת המשימות'},
          ]);
        }
        return this.content.waitForInput();
      }),
      switchMap(() => {
        const report = Object.assign({}, this.report, {finished_intake: true, saved_state: this.runner.state});
        return this.api.updateReport(report);
      })
    ).subscribe((report) => {
        this.report = Object.assign(this.report, report);
    }, () => {});
  }

  restart() {
    this.api.getReport(this.report.id)
      .pipe(
        switchMap((report) => this.api.deleteTasks(report.tasks || [])),
        switchMap(() => this.api.getReport(this.report.id))
      )
      .subscribe((report) => {
        this.report = Object.assign(this.report, report, {saved_state: {}});
        this.ngOnDestroy();
        this.init();
        this.ngOnInit();
      });
  }

}
