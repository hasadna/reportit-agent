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
        combinedPoliceEventDescription: async (record) => {
          let new_description = record.event_description + `\n \n פרטים נוספים, משיחה עם המוקדנ/ית: \n`;
          if (record._police_more_details !== 'false') {
            new_description += `${record._police_more_details}\n`;
          }
          new_description += `${record._police_arrest} \n`;
          new_description += `${record._police_court} \n`;
          new_description += `${record._police_has_lawyer} \n`;
          if (typeof record._police_witness_details !== 'undefined') {
            new_description += `${record._police_witness_details}`;
          } else {
            new_description += `אין פרטים של עדי ראייה`;
          }
          return new_description;
        },
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
        shareWithJusticeMinistry: async (record) => {
          const org = this.infocards.getOrg('justice_ministry_anti_racism_unit');
          console.log('Share with Justice Ministry');
          this.infocards.addTask(record,
                                 'send_report_to_governmental_unit',
                                 org,
                                 'org:justice_ministry_anti_racism_unit');
        },
        shareAnonymouslyWithJusticeMinistry: async (record) => {
          const org = this.infocards.getOrg('justice_ministry_anti_racism_unit');
          console.log('Anonymously share with Justice Ministry');
          this.infocards.addTask(record,
                                  'org_send_anonymously',
                                  org,
                                  'org:justice_ministry_anti_racism_unit');
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
