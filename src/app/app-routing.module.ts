import { NgModule, Injectable } from '@angular/core';
import { Routes, RouterModule, Route, CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { LoginPageComponent } from './login-page/login-page.component';
import { MainPageComponent } from './main-page/main-page.component';
import { DetailPageComponent } from './detail-page/detail-page.component';
import { StrapiService } from './strapi.service';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private router: Router, private api: StrapiService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
      if (this.api.token.getValue()) {
        return true;
      }

      // not logged in so redirect to login page with the return url and return false
      this.router.navigate(['login'], { queryParams: { next: state.url }});
      return false;
    }
}


const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: 'report/:id', component: DetailPageComponent, canActivate: [AuthGuard] },
  { path: '', component: MainPageComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
