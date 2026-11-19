import { Component } from '@angular/core';
import { CarouselComponent } from '@medra.dev/ui';

interface WorkshopTool {
  readonly name: string;
  readonly category: string;
  readonly priceLabel: string;
}

@Component({
  selector: 'app-carousel-basic-demo',
  imports: [CarouselComponent],
  templateUrl: './carousel-basic.demo.html',
})
export class CarouselBasicDemo {
  protected readonly tools: WorkshopTool[] = [
    { name: 'Hand plane', category: 'Woodworking', priceLabel: '$38' },
    { name: 'Coping saw', category: 'Woodworking', priceLabel: '$14' },
    { name: 'Digital caliper', category: 'Measuring', priceLabel: '$22' },
    { name: 'Bench vise', category: 'Fixturing', priceLabel: '$61' },
    { name: 'Rotary tool', category: 'Power tools', priceLabel: '$47' },
    { name: 'Feather boards', category: 'Fixturing', priceLabel: '$19' },
    { name: 'Dovetail jig', category: 'Woodworking', priceLabel: '$85' },
    { name: 'Cordless drill', category: 'Power tools', priceLabel: '$96' },
  ];
}
