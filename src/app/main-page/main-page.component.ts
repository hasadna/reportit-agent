import { Component, OnInit } from '@angular/core';
import { StrapiService } from '../strapi.service';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.less']
})
export class MainPageComponent implements OnInit {

  profile: any = null;
  reports: any[] = [];

  constructor(public api: StrapiService) { }

  ngOnInit() {
    this.api.profile.subscribe(
      (profile) => {
        this.profile = profile;
        this.api.getReports()
        .subscribe((reports) => {
          this.reports = reports.sort((a, b) => a.id < b.id ? 1 : -1);
        });
      }
    );
  }

}
