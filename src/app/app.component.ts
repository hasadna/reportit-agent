import { Component, OnInit } from '@angular/core';
import { ScriptRunnerService, ContentService, FileUploader } from 'hatool';
import { HubspotService } from './hubspot.service';
import { switchMap } from 'rxjs/operators';
import Script from '../assets/script.json';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['./app.component.less']
})

export class AppComponent implements OnInit {
  title = 'hatool';

  constructor(private runner: ScriptRunnerService,
              private content: ContentService,
              private hubspot: HubspotService,
            ) {}

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


      const retrieveRelevantOrgs = async (record, scriptNo) => {
        // retrieve the the list of NGOs, exclude the `default` thread
        const allOrgs: {'topic'?: string, 'script'?: any}[] = Script[scriptNo].script.slice(1);
        const relevantorgs = allOrgs.filter( (org) => {
              const orgMetaData = org.script[0].meta; // get the ngo metadata

              // run over the organziation relevancy parameters
              for (let condition = 0; condition <= orgMetaData.length - 1; condition++) {
                const [conditionKey, conditionValue] = [orgMetaData[condition].key, orgMetaData[condition].value];

                  if (            // here is the logic to decide which NGO is relevant. We can add any kind of logic.
                      (conditionKey === 'offender' && conditionValue === record.offender) ||
                      (conditionKey === 'complaintType' && conditionValue === record.complaint_type)
                      ) { return 1; }
                    }
                  return 0;
                });
        return relevantorgs;
      };

      const selectOrgsToShareDataWith = async (record, scriptNo: string) => {
        // function to ask user who to share the data with

        const organizationsList = record._relevantorgs;

        if (!record.send_contact_details_to_user) {record.send_contact_details_to_user = ''; }

        let share_with_orgs = ' ';
        // retrieve the repeating question + options to check per organization
            const [question, options] = [Script[scriptNo].script[0]['script'][0].text,
                                         Script[scriptNo].script[0]['script'][0].quick_replies.map(
                                                              (x) => {
                                                                        return {
                                                                               'display' : x['title'],
                                                                               'value' :  x['payload']
                                                                               };
                                                                      }
                                                                )
                                                      ];
          console.log(`Relevant Orgs:`, organizationsList);

          this.content.addTo(`נמצאו ${organizationsList.length} אפשרויות רלוונטיות לנושא הפניה:`);

      // ask the returning questio for eaach relevant organization
        for (const organization of organizationsList) {
            try {
              const orgName = organization.topic;
              const orgDescription = organization.script[0].text;
              // show the organziation details
              this.content.addTo(`${orgName}: <br> ${orgDescription}`);

              this.content.addOptions(question, options);
              const shareWithThisOrg =  await this.content.waitForInput();

              if (shareWithThisOrg === 'true') {                // if user approves, add org to the record field
                share_with_orgs += `${orgName}, `;
              } else if (shareWithThisOrg === 'askedForContactDetails') { // if user asked for the organization contact details
                record.send_contact_details_to_user += `${orgName}, `;        // add the org name directly to the relevant record field
              }
            } catch (error) {
              console.log('error ' + error);
            }
          }
        console.log('share_with_org: ', share_with_orgs);
        return await share_with_orgs;
      } ;

    const vid = window.location.search.slice(1).split('&')[0].split('=')[1];
    this.hubspot.getUser(vid)
        .pipe(
          switchMap((userInfo) =>
            this.runner.run(
              'assets/script.json',
              1,
              {
                getOffender: async (record) => {
                  return record.offender;
                },
                checkRelevantNGOs: async (record) => retrieveRelevantOrgs(record, '3'),
                chooseNGOsToShareWith: async (record) =>  selectOrgsToShareDataWith(record, '3'),

                checkRelevantGovernmentDepartments: async (record) => retrieveRelevantOrgs(record, '4'),
                chooseGovernmentDeptToShareWith: async (record) =>  selectOrgsToShareDataWith(record, '4'),

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
                saveUser: async (record) => {
                  const recordToSave = recordKeysToSave(record);
                  await this.hubspot.updateUser(recordToSave);
                },
                uploader: async (key, uploader: FileUploader) => {
                  uploader.active = true;
                  const uploaded = await this.hubspot.uploadFile(
                    uploader.selectedFile, this.hubspot.vid + '/' + key,
                      (progress) => { uploader.progress = progress; },
                      (success) => { uploader.success = success; }
                  );
                  return uploaded;
                }
              },
              (key, value) => {},
              userInfo
            )
          )
        ).subscribe(() => { console.log('done!'); });
  }
}
