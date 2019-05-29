import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StrapiService {

  BASE_URL = 'https://reportit-cms.obudget.org';
  URL_GET_PROFILE = this.BASE_URL + '/users/me';
  URL_LOGIN = this.BASE_URL + '/auth/local';
  URL_GET_REPORTS = this.BASE_URL + '/reports';
  URL_GET_REPORT = this.URL_GET_REPORTS + '/';
  URL_UPDATE_REPORT = this.URL_GET_REPORT;

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

  updateReport(report): Observable<any> {
    return this.http.put(this.URL_UPDATE_REPORT + report.id, report, {
      headers: {
        Authorization: `Bearer ${this.token.getValue()}`
      }
    }).pipe(
      map((response: any) => response.statusCode ? null : response)
    );
  }

  getReports(): Observable<any[]> {
    return this.http.get(this.URL_GET_REPORTS, {
      headers: {
        Authorization: `Bearer ${this.token.getValue()}`
      }
    }).pipe(
      map((response: any) => response.statusCode ? null : response)
    );
  }
}
