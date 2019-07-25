import { Component, OnInit, Input } from '@angular/core';
import { StrapiService } from '../strapi.service';
import * as moment from 'moment';
import { isObject } from 'util';

@Component({
  selector: 'app-single-task-update',
  templateUrl: './single-task-update.component.html',
  styleUrls: ['./single-task-update.component.less']
})
export class SingleTaskUpdateComponent implements OnInit {

  @Input() update: any;
  avatar = '';
  username = '';

  constructor(private api: StrapiService) {
  }

  humanize(x) {
    return moment.min(moment(), moment(x)).fromNow();
  }

  ngOnInit() {
    let user_id = this.update.user;
    if (isObject(user_id)) {
      user_id = user_id.id;
    }
    this.api.getUserProfile(user_id)
      .subscribe((profile) => {
        this.avatar = profile.gravatar;
        this.username = profile.username;
      });
  }

}
