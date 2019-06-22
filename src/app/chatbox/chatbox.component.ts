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

  ngOnInit() {
    this.content.sendButtonText = '';
    this.content.uploadFileText = 'לחצ/י לבחירת קובץ';
    this.content.uploadedFileText = 'קובץ הועלה בהצלחה';
    this.content.notUploadedFileText = 'תקלה בהעלאת קובץ';
    this.content.inputPlaceholder = 'הקלידו הודעה...';

    const recordKeysToSave = (record) => {
      // filter records fields, to save those that do not start with '_'
      const result = {};
      for (const key in record) {
        if (key.match(/^[^_]/)) {
          result[key] = record[key];
          }
        }
        return result;
    };


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
          return `${record.event_description} \n \n \
                        פרטים נוספים, בשיחה עם המוקדנ/ית: ${record._police_more_details}, \n
                        ${record._police_arrest}, \n
                        ${record._police_court}, \n
                        ${record._police_has_lawyer}, \n
                        עדי ראייה: ${record._police_witness_details},
                        `;
        },
        countFiles: async (record) => {
          let counter = 0;
          for (let index = 1; index <= 5; index++) {
            const fileName = 'file' + (index.toString());

            if (fileName in record) {
              counter += 1;
            }
          }
          console.log('File Counter: ' + counter.toString());
          return counter.toString();
        },
        shareWithJusticeMinistry: async (record) => {
            for (const org of this.infocards.allOrgs) {
            if (org['slug'] === 'justice_ministry_anti_racism_unit') {
                console.log('Orgs: ' , org);
                console.log('Share with Justice Ministry');
                   this.infocards.addTask(record,
                                          'send_report_to_governmental_unit',
                                          org,
                                          'org:justice_ministry_anti_racism_unit');
            }
        }},
        shareAnonyomuslyWithJusticeMinistry: async (record) => {
          for (const org of this.infocards.allOrgs) {
          if (org['slug'] === 'justice_ministry_anti_racism_unit') {
                    console.log('Anonymously share with Justice Ministry');
                    this.infocards.addTask(record,
                                          'org_send_anonymously',
                                          org,
                                          'org:justice_ministry_anti_racism_unit');
              }
            }},
        selectGovOrgs: async (record) => {
          for (const org of this.infocards.allOrgs) {
            console.log('select Gov org:', org);
            if (org['Organization Type'] === 'יחידה ממשלתית') {
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
          const recordToSave = recordKeysToSave(record);
          this.strapi.updateReport(recordToSave)
              .subscribe(() => { console.log('SAVED!'); });
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
            this.infocards.appendCard('info:' + item.value);
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
    });
  }

}
