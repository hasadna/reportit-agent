import { Component, OnInit } from '@angular/core';
import { StrapiService } from '../strapi.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.less']
})
export class LoginPageComponent implements OnInit {

  username: string;
  password: string;

  constructor(public api: StrapiService) { }

  ngOnInit() {
  }

}
