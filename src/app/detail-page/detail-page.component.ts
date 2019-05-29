import { Component, OnInit } from '@angular/core';
import { StrapiService } from '../strapi.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-detail-page',
  templateUrl: './detail-page.component.html',
  styleUrls: ['./detail-page.component.less']
})
export class DetailPageComponent implements OnInit {

  report: any;

  constructor(private api: StrapiService, private route: ActivatedRoute) {
    route.paramMap
      .pipe(
        switchMap((params: ParamMap) => api.getReport(params.get('id')))
      )
      .subscribe((report) => {
        this.report = report;
      });
  }

  ngOnInit() {
  }

}
