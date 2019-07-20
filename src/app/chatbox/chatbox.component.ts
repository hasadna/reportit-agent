import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ScriptRunner, ContentManager, FileUploader } from 'hatool';
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
  runner: ScriptRunner;

  constructor(private strapi: StrapiService,
              private infocards: InfoCardsService,
              private http: HttpClient,
  ) {
    this.content = new ContentManager();
    this.runner = new ScriptRunner(this.http, this.content);
    console.log('CHAT INIT!!');
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
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

    this.subscription = this.runner.run(
      'assets/script.json',
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
          console.log('complaint type: ', record.complaint_type);
          return record.complaint_type;
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
            this.content.addTo('אם הארוע\
             המפלה התרחש בתחומי רשות ציבורית\
            (בית חולים, משרד ממשלתי, תחבורה ציבורית)\
           כדאי בכל מקרה להגיש תלונה\
            לממונה על טיפול בתלונות בנושא גזענות במשרד הרלוונטי');
           this.infocards.appendCard('office_preventing_racism');
           this.content.addOptions('בדקו האם ישנו ממונה במשרד הרלוונטי:', [
                { display: 'כן', value: () => { console.log('yes');
                                                this.infocards.addTask(record,
                                                                       'share_with_office_fight_racism_contact',
                                                                       {},
                                                                        '');
                                              }
                                            },
                { display: 'לא', value: () => { console.log('no'); } },
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
              this.content.addOptions('האם הפונה מעוניין לקבל סיוע בפנייה למחלקת האבטחה והרישוי במשטרה והגשת תלונה על המאבטח?', [
                   { display: 'כן', value: () => { console.log('yes');
                                                   this.infocards.addTask(record,
                                                                          'compaint_guard_to_police',
                                                                          {},
                                                                           '');
                                                 }
                                               },
                   { display: 'לא', value: () => { console.log('no'); } },
                 ]);
                 (await this.content.waitForInput())();
               }}},
      countFiles: async (record) => {
          let counter = 0;
          for (let index = 1; index <= 5; index++) {
            const fileName = `file${index.toString()}description`;

            if (fileName in record && record[fileName] !== null ) {
              console.log(`Found file ${index}: ${record[fileName]}`);
              counter += 1;
            }
          }
          console.log('File Counter: ' + counter.toString());
          return counter.toString();
        },
        checkIfUltraOrthodoxEducationOrg: async (record) => {
          if (record.offender_details === 'חינוך חרדי') {
            return 'true';
          }
          return 'false';
        },
        shareWithJusticeMinistry: async (record) => {
          this.infocards.addTask(record,
                                 'share_full_details_with_justice_ministry',
                                 {},
                                 ''
                                 );
        },
        shareAnonymouslyWithJusticeMinistry: async (record) => {
          this.infocards.addTask(record,
                                  'share_anonymously_with_justice_ministry',
                                  {},
                                  ''
                                );
        },
        selectGovOrgs: async (record) => {
          for (const org of this.infocards.allOrgs) {
            console.log('select Gov org:', org);
            if (org['Organization Type'] === 'יחידה ממשלתית') {
              if (!this.matchScenarios(record, org.scenarios)) {
                continue;
              }
              this.content.addTo(`האם תרצו לשתף את המקרה עם ${org['Organization Name']}?`,
                                 () => { this.infocards.appendCard('org:' + org.slug); });
              this.content.addOptions(null, [
                { display: 'כן', value: () => { console.log('yes');
                                                this.infocards.addTask(record, 'send_report_to_governmental_unit', org, 'org:' + org.slug);
                                              }
                                            },
                { display: 'לא', value: () => { console.log('no'); } },
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
              this.content.addTo(`האם תרצו לשתף את המקרה עם ${org['Organization Name']}?`,
                                 () => { this.infocards.appendCard('org:' + org.slug); });
              this.content.addOptions(null, [
                { display: 'כן', value: () => { console.log('yes');
                                                this.infocards.addTask(record, 'send_to_ngo', org, 'org:' + org.slug);
                                              }
                },
               { display: 'מאשר/ת להעביר את תיאור המקרה, ללא פרטים מזהים',
                 value: () => {
                              console.log('Anonymously');
                              this.infocards.addTask(record, 'org_send_anonymously', org, 'org:' + org.slug);
                              }
                },
                { display: 'לא',
                  value: () => {
                      console.log('no');
                    }
                }
              ]);
              (await this.content.waitForInput())();
            }
          }
        },
        /// Generic Utils
        saveUser: async (record) => {
          this.strapi.updateReport(record)
              .subscribe(() => { console.log('SAVED!'); }, () => {});
        },
        uploader: async (record, key, uploader: FileUploader) => {
          uploader.active = true;
          const uploaded = await this.strapi.uploadFile(
            record.id,
            uploader.selectedFile, record.id + '/' + key,
              (progress) => { uploader.progress = progress; },
              (success) => { uploader.success = success; }
          );
          return uploaded;
        },
      },
      (key, value) => {},
      this.report,
      (meta) => {
        for (const item of meta) {
          if (item.key === 'infocard') {
            this.infocards.appendCard(item.value);
          }
        }
      },
      (event) => {
        this.infocards.addTask(this.report, event, {}, '');
      }
    ).pipe(
      switchMap(() => {
        const report = Object.assign({}, this.report, {finished_intake: true});
        return this.strapi.updateReport(report);
      })
    ).subscribe((report) => {
        this.report = Object.assign(this.report, report);
        console.log('done!');
    }, () => {});
  }

}
