import { Component } from '@angular/core';
import { BadgeComponent, CardComponent, CardSubtitleDirective, CardTitleDirective, IconComponent } from '@medra/ui';

@Component({
  selector: 'app-card-rich-title-demo',
  imports: [CardComponent, CardTitleDirective, CardSubtitleDirective, IconComponent, BadgeComponent],
  templateUrl: './card-rich-title.demo.html',
})
export class CardRichTitleDemo {}
