import { Component, OnInit } from '@angular/core';
import { ScriptRunnerService, ContentService, FileUploader } from 'hatool';
import { HubspotService } from './hubspot.service';
import { switchMap } from 'rxjs/operators';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
  title = 'hatool';

  constructor(private runner: ScriptRunnerService,
              private content: ContentService,
              private hubspot: HubspotService) {}

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
                combinedPoliceEventDescription: async (record) => {
                  record.event_description = `${record.event_description} \n \n \
                                ${_police_arrest}, \
                                ${_police_court}, \
                                ${_police_has_lawyer}, \
                                עדי ראייה: ${_police_witness_details},
                                `;
                  console.log('new description: ', record.event_description);
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
