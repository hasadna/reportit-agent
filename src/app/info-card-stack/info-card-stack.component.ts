import { Component, OnInit, ElementRef } from '@angular/core';
import { InfoCardsService } from '../info-cards.service';

@Component({
  selector: 'app-info-card-stack',
  templateUrl: './info-card-stack.component.html',
  styleUrls: ['./info-card-stack.component.less']
})
export class InfoCardStackComponent implements OnInit {

  cards: any[] = [];
  filler = true;

  constructor(private infoCards: InfoCardsService, private container: ElementRef) {
    infoCards.infoCards.subscribe((cards) => {
      this.cards = cards;
      window.setTimeout(() => {
        if (this.container) {
          const el = this.container.nativeElement;
          el.scrollTop = el.scrollHeight;
          if (el.scrollTop > el.offsetHeight) {
            this.filler = false;
          }
        }
      }, 100);
    });
  }

  ngOnInit() {
  }

}
