import { Component } from '@angular/core';
import { StrapiService } from './strapi.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  constructor(api: StrapiService, router: Router) {
    api.loggedIn.subscribe((loggedIn) => {
      console.log('LOGGED IN', loggedIn);
      if (loggedIn === false) {
        router.navigate(['login']);
      }
    });
  }
}
