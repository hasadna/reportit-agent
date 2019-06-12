import { Component, OnInit, Input } from '@angular/core';
import { InfoCardsService } from '../info-cards.service';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.less']
})
export class TasksComponent implements OnInit {

  @Input() report: any;

  constructor(private infoCards: InfoCardsService) { }

  ngOnInit() {
    this.infoCards.clear();
  }

}
