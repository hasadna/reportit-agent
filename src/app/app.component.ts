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

          if (organizationsList.length > 0) {
            this.content.addTo(`נמצאו ${organizationsList.length} אפשרויות רלוונטיות לנושא הפניה:`);
          }

      // ask the returning question for eaach relevant organization
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


      const retrieveRelevantActions = async (record, scriptNo) => {
        // retrieve the the list of NGOs, exclude the `default` thread
        const allActions: {'topic'?: string, 'script'?: any}[] = Script[scriptNo].script.slice(1);

        const relevantactions = allActions.filter( (action) => {
              const actionMetaData = action.script[0].meta; // get the action metadata
              // run over the organziation relevancy parameters
              for (let condition = 0; condition <= actionMetaData.length - 1; condition++) {
                const [conditionKey, conditionValue] = [actionMetaData[condition].key, actionMetaData[condition].value];
                  if (            // here is the logic to decide which action is relevant. We can add any kind of logic.
                      (conditionKey === 'offender' && conditionValue === record.offender) ||
                      (conditionKey === 'complaint_type' && conditionValue === record.complaint_type)
                      ) { return 1; }
                    }
                  return 0;
                });
        return relevantactions;
      };

      const selectActionsToTake = async (record, scriptNo: string) => {
        // function to ask user who to share the data with

        const actionsList = record._relevantactions;

        if (!record.required_service) {record.required_service = ' '; }

        let actions_to_take = record.required_service;

        console.log(`Relevant Actions:`, actionsList);

          if (actionsList.length > 0) {
            this.content.addTo(`נמצאו ${actionsList.length} פעולות שניתן להציג לפונה, כדי לברר אם יהיה/תהיה מועניינ/ת לבחון:`);
          }

          // iterate over the relevant actions and ask for user input
        for (const action of actionsList) {
            try {
              const actionText = action.script[0].text;
              const options = action.script[0].quick_replies.map(
                                   (x) => {
                                             return {
                                                    'display' : x['title'],
                                                    'value' :  x['payload']
                                                    };
                                           }
                                     );

              this.content.addOptions(actionText, options);
              const actionResponse =  await this.content.waitForInput();

              if (actionResponse !== 'false') {                // if user approves, add org to the record field
                  actions_to_take += `* ${actionResponse} \n`;
                }

              } catch (error) {
                console.log('error ' + error);
              }
            }
        console.log('actions_to_take: ', actions_to_take);
        return await actions_to_take;
      };

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

                checkRelevantActions: async (record) => retrieveRelevantActions(record, '5'),
                chooseRelevantActions: async (record) => selectActionsToTake(record, '5'),

                combinedPoliceEventDescription: async (record) => {
                  let result = ' ';
                  if (record.event_description) {
                     result = record.event_description;
                   }
                  result += ` \n
                                פרטים נוספים, בשיחה עם המוקדנ/ית: ${record._police_more_details}, \n
                                ${record._police_arrest}, \n
                                ${record._police_court}, \n
                                ${record._police_has_lawyer},
                                `;
                 if (record._police_witness_details) {
                   result +=   `\n עדי ראייה: ${record._police_witness_details}`;
                 }
                 return result;
                },

                combinedEventDescription: async (record) =>  {
                  let result = '';
                  if (record.event_description) {
                     result = record.event_description;
                   }
                     if (record._details_to_add_to_description || record._witness_details) {
                            result +=  `\n פרטים נוספים, בשיחה עם המוקדנ/ית:\n`;
                        if (record._details_to_add_to_description) {
                            result += `\n${ record._details_to_add_to_description }`;
                        }
                        if (record._witness_details) {
                          result += `\nעדי ראייה:${record._witness_details}`;
                        }
                      }
                      return result;
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
