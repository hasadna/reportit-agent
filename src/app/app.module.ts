import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { MainPageComponent } from './main-page/main-page.component';
import { ReportListComponent } from './report-list/report-list.component';
import { UserInfoComponent } from './user-info/user-info.component';
import { ReportPageComponent } from './report-page/report-page.component';
import { SingleReportComponent } from './single-report/single-report.component';
import { SystemStatusComponent } from './system-status/system-status.component';
import { DetailPageComponent } from './detail-page/detail-page.component';
import { ReportEditComponent } from './report-edit/report-edit.component';
import { ChatboxComponent } from './chatbox/chatbox.component';
import { InfoCardStackComponent } from './info-card-stack/info-card-stack.component';
import { SidePaneComponent } from './side-pane/side-pane.component';
import { StatusWidgetComponent } from './status-widget/status-widget.component';
import { EditableFieldWidgetComponent } from './editable-field-widget/editable-field-widget.component';
import { Nl2brPipe } from './nl2br.pipe';
import { HatoolLibModule } from 'hatool';
import { InfoCardComponent } from './info-card/info-card.component';
import { OrgCardComponent } from './org-card/org-card.component';
import { TaskCardComponent } from './task-card/task-card.component';
import { TasksComponent } from './tasks/tasks.component';
import { SingleTaskComponent } from './single-task/single-task.component';
import { SingleTaskUpdateComponent } from './single-task-update/single-task-update.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    MainPageComponent,
    ReportListComponent,
    UserInfoComponent,
    ReportPageComponent,
    SingleReportComponent,
    SystemStatusComponent,
    DetailPageComponent,
    ReportEditComponent,
    ChatboxComponent,
    InfoCardStackComponent,
    SidePaneComponent,
    StatusWidgetComponent,
    EditableFieldWidgetComponent,
    Nl2brPipe,
    InfoCardComponent,
    OrgCardComponent,
    TaskCardComponent,
    TasksComponent,
    SingleTaskComponent,
    SingleTaskUpdateComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    HatoolLibModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
