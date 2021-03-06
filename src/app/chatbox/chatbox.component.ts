import { Component, OnInit, Input, OnDestroy, Inject, LOCALE_ID, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
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
export class ChatboxComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() report: any;
  subscription: Subscription = null;
  content: ContentManager;
  runner: ScriptRunnerImpl;
  restart_modal_active = false;

  @ViewChild('uploadFileText') uploadFileText: ElementRef;
  @ViewChild('uploadedFileText') uploadedFileText: ElementRef;
  @ViewChild('notUploadedFileText') notUploadedFileText: ElementRef;
  @ViewChild('inputPlaceholder') inputPlaceholder: ElementRef;

  constructor(private api: StrapiService,
              private infocards: InfoCardsService,
              private http: HttpClient,
              @Inject(LOCALE_ID) private locale,
  ) {
    this.init();
  }

  init() {
    this.content = new ContentManager();
    this.runner = new ScriptRunnerImpl(this.http, this.content, this.locale);
    this.runner.debug = false;
    this.content.debug = false;
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
    if (!record) {
      return false;
    }
    scenarios = scenarios || [];
    if (scenarios.length === 0) {
      return true;
    }
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

  prepareOrgs(record, kind) {
    const ret = [];
    for (const org of this.infocards.allOrgs) {
      if (org['organizationType'] === kind) {
        if (this.matchScenarios(record, org.scenarios)) {
          ret.push(org);
        }
      }
    }
    return ret;
  }

  ngAfterViewInit() {
    this.content.uploadFileText = this.uploadFileText.nativeElement.innerHTML;
    this.content.uploadedFileText = this.uploadedFileText.nativeElement.innerHTML;
    this.content.notUploadedFileText = this.notUploadedFileText.nativeElement.innerHTML;
    this.content.inputPlaceholder = this.inputPlaceholder.nativeElement.innerHTML;
  }

  ngOnInit() {
    this.content.sendButtonText = '';
    this.infocards.clear();
    this.runner.state = Object.assign({}, this.report.saved_state || {});
    console.log('STATE:', this.runner.state);

    this.report._num_tasks = this.report.tasks.length;

    this.subscription = this.runner.run(
      'https://raw.githubusercontent.com/hasadna/reportit-scripts/master/src/agent/script.json',
      0,
      {
        /// Specific Utils
        prepareGovOrgs: async (record) => {
          record._selectedGovOrgs = this.prepareOrgs(record, 'יחידה ממשלתית');
        },
        prepareNgoOrgs: async (record) => {
          record._selectedNgoOrgs = this.prepareOrgs(record, 'ארגון חברה אזרחית');
        },
        nextGovOrg: async (record) => {
          if (!record._selectedGovOrgs || record._selectedGovOrgs.length === 0) {
            return '';
          }
          const org = (<any[]>record._selectedGovOrgs).shift();
          this.infocards.appendCard('org:' + org.slug);
          return org;
        },
        nextNgoOrg: async (record) => {
          console.log('nextNgoOrg', record._selectedNgoOrgs);
          if (!record._selectedNgoOrgs || record._selectedNgoOrgs.length === 0) {
            return '';
          }
          const org = (<any[]>record._selectedNgoOrgs).shift();
          this.infocards.appendCard('org:' + org.slug);
          return org;
        },
        addOrgTask: async (record, field_name, task_name) => {
          this.infocards.addTask(record, task_name, record[field_name], 'org:' + record[field_name].slug);
        },
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
              (<any>await this.content.waitForInput())();
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
                 (<any>await this.content.waitForInput())();
               }}},
        getGuardCompany: async (record) => {
          if (record.offender === 'מאבטח/ת') {
            if (record.offender_organization === null || record.offender_organization === '') {
              return '';
            } else {
              return record.offender_organization;
            }
        }},
        countFiles: async (record) => {
          return record.evidence_files.length;
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
          console.log('uploader');
          uploader.active = true;
          const uploaded = this.api.uploadFile(
            record.id,
            uploader.selectedFile, record.id + '/',
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
        return this.content.waitForInput(false);
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
        this.ngAfterViewInit();
      });
  }

}
