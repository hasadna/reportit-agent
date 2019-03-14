import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEventType, HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HubspotService {

  CONTACT_URL = 'https://reportit.obudget.org/hubspot/contacts/v1/contact/';
  CONTACT_UPDATE_URL = 'https://reportit.obudget.org/hubspot/contacts/v1/contact/vid/:vid/profile';
  CONTACT_GET_URL = 'https://reportit.obudget.org/hubspot/contacts/v1/contact/vid/:vid/profile';
  FILE_UPLOAD = 'https://reportit.obudget.org/hubspot/filemanager/api/v2/files';
  vid: any = null;

  constructor(private http: HttpClient) { }

  createUser(data: any) {
    const properties = Object.entries(data)
      .map(value => {
        return {property: value[0], value: value[1]};
      });
    const body = {properties};
    console.log('create', body);
    return new Promise((resolve, _) => {
      this.http.post(this.CONTACT_URL, body)
          .subscribe((response: any) => {
            console.log('create user got', response);
            this.vid = response.vid;
            resolve(this.vid);
          });
    });
  }

  updateUser(data: any) {
    const properties = Object.entries(data)
      .map(value => {
        return {property: value[0], value: value[1]};
      });
    const body = {properties};
    console.log('update', body);
    return new Promise((resolve, _) => {
      this.http.post(this.CONTACT_UPDATE_URL.replace(':vid', this.vid), body)
          .subscribe(() => {
            console.log('updated user');
            resolve();
          });
    });
  }

  getUser(vid: any) {
    return new Promise((resolve, _) => {
      this.http.get(this.CONTACT_GET_URL.replace(':vid', vid))
          .subscribe((response: any) => {
            const properties = response.properties;
            const ret = {};
            for (const key of Object.keys(properties)) {
              ret[key] = properties[key].value;
            }
            resolve(ret);
          });
    });
  }

  uploadFile(file: File, path, progress, success) {
    return new Promise((resolve, _) => {
      const formData: FormData = new FormData();
      formData.append('files', file, file.name);
      formData.append('folder_paths', path);

      // create a http-post request and pass the form
      // tell it to report the upload progress
      const req = new HttpRequest('POST', this.FILE_UPLOAD, formData, {
        reportProgress: true
      });


      // send the http-request and subscribe for progress-updates
      this.http.request(req).subscribe(event => {
        if (event.type === HttpEventType.UploadProgress) {

          // calculate the progress percentage
          const percentDone = Math.round(100 * event.loaded / event.total);

          // pass the percentage into the progress-stream
          progress(percentDone);
        } else if (event instanceof HttpResponse) {

          // Close the progress-stream if we get an answer form the API
          // The upload is complete
          success(true);
          console.log(event.body);
          resolve(event.body['objects'][0]['url']);
        }
      });
    });
  }
}
