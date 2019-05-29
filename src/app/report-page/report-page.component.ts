import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { StrapiService } from '../strapi.service';

import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-report-page',
  templateUrl: './report-page.component.html',
  styleUrls: ['./report-page.component.less']
})
export class ReportPageComponent implements OnInit {

  report: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: StrapiService
  ) { }

  ngOnInit() {
    this.report = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => this.api.getReport(params.get('id')))
    );
  }

}
