import { Component, OnInit } from '@angular/core';
import { StrapiService } from '../strapi.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.less']
})
export class LoginPageComponent implements OnInit {

  username: string;
  password: string;
  returnUrl: string;
  error: string;

  constructor(public api: StrapiService,
              private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['next'] || '/';
    this.api.loggedIn.subscribe((loggedIn) => {
      if (loggedIn) {
        this.router.navigate([this.returnUrl]);
      }
    });
    this.api.loggedInError.subscribe((message) => {
      this.error = message;
    });
  }

  login() {
    this.error = null;
    this.api.login(this.username, this.password);
  }
}
