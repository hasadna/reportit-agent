import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient, HttpEventType, HttpResponse, HttpRequest } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StrapiService {
  BASE_URL = 'https://reportit-cms.obudget.org';

  URL_GET_PROFILE = this.BASE_URL + '/users/me';
  URL_LOGIN = this.BASE_URL + '/auth/local';

  URL_GET_REPORTS = this.BASE_URL + '/reports';
  URL_GET_INFOCARDS = this.BASE_URL + '/infocards';
  URL_GET_ORGS = this.BASE_URL + '/organizations';
  URL_GET_TASK_TEMPLATES = this.BASE_URL + '/tasktemplates';
  URL_GET_TASKS = this.BASE_URL + '/tasks';

  URL_GET_REPORT = this.URL_GET_REPORTS + '/';
  URL_GET_TASK = this.URL_GET_TASKS + '/';

  URL_NEW_TASK = this.URL_GET_TASKS;

  URL_UPDATE_REPORT = this.URL_GET_REPORT;
  URL_UPDATE_TASK = this.URL_GET_TASK;

  FILE_UPLOAD = this.BASE_URL + '/upload/';

  loggedIn = new BehaviorSubject<boolean>(null);
  token = new BehaviorSubject<string>(null);
  profile = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient) {
    this.token.next(window.localStorage.jwt);
    this.token.subscribe((token) => {
      console.log('TOKEN', token);
      if (token) {
        window.localStorage.jwt = token;
        this.getProfile(token);
      } else {
        this.loggedIn.next(false);
      }
    });
    // window.setTimeout(() => {
    //   this.login('adam', 'AyaStrapi999');
    // }, 5000);
  }

  login(user, password) {
    this.http.post(this.URL_LOGIN, {
      identifier: user,
      password: password
    }).subscribe((response: any) => {
      if (response.jwt) {
        this.token.next(response.jwt);
      } else {
        this.loggedIn.next(false);
      }
    });
  }

  uploadFile(report_id, file: File, path, progress, success) {
    return new Promise((resolve, _) => {
      const formData: FormData = new FormData();
      formData.append('files', file, file.name);
      formData.append('path', path);
      formData.append('refId', report_id);
      formData.append('ref', 'report');
      formData.append('field', 'evidence_files');

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
          resolve(event.body);
        }
      });
    });
  }

  getProfile(token) {
    console.log('GET PROFILE', token);
    this.http.get(this.URL_GET_PROFILE, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).pipe(
      catchError((error, caught) => {
        return of({});
      })
    ).subscribe((response: any) => {
      if (response.username) {
        this.profile.next(response);
        this.loggedIn.next(true);
      } else {
        this.loggedIn.next(false);
      }
    });
  }

  getReport(id): Observable<any> {
    return this.http.get(this.URL_GET_REPORT + id, {
      headers: {
        Authorization: `Bearer ${this.token.getValue()}`
      }
    }).pipe(
      map((response: any) => response.statusCode ? null : response)
    );
  }

  updateByType(url, item): Observable<any> {
    return this.http.put(url + item.id, item, {
      headers: {
        Authorization: `Bearer ${this.token.getValue()}`
      }
    }).pipe(
      map((response: any) => response.statusCode ? null : response)
    );
  }

  updateReport(report): Observable<any> {
    return this.updateByType(this.URL_UPDATE_REPORT, report);
  }

  updateTask(task): Observable<any> {
    return this.updateByType(this.URL_UPDATE_TASK, task);
  }

  getByType(url): Observable<any[]> {
    return this.http.get(url, {
      headers: {
        Authorization: `Bearer ${this.token.getValue()}`
      }
    }).pipe(
      map((response: any) => response.statusCode ? null : response)
    );
  }

  getReports(): Observable<any[]> {
    return this.getByType(this.URL_GET_REPORTS);
  }

  getInfoCards(): Observable<any[]> {
    return this.getByType(this.URL_GET_INFOCARDS);
  }

  getOrgCards(): Observable<any[]> {
    return this.getByType(this.URL_GET_ORGS);
  }

  getTaskTemplates(): Observable<any[]> {
    return this.getByType(this.URL_GET_TASK_TEMPLATES);
  }

  addTask(newTask: any): Observable<any> {
    return this.http.post(this.URL_NEW_TASK, newTask, {
      headers: {
        Authorization: `Bearer ${this.token.getValue()}`
      }
    }).pipe(
      map((response: any) => response.statusCode ? null : response)
    );
  }

}
