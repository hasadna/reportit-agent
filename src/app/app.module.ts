import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HatoolLibModule } from 'hatool';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import {APP_BASE_HREF} from '@angular/common';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HatoolLibModule,
    HttpClientModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
