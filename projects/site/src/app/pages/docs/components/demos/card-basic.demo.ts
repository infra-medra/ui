import { Component } from '@angular/core';
import { CardComponent, CardFooterDirective, CardHeaderDirective } from '@medra/ui';

@Component({
  selector: 'app-card-basic-demo',
  imports: [CardComponent, CardHeaderDirective, CardFooterDirective],
  templateUrl: './card-basic.demo.html',
})
export class CardBasicDemo {}
