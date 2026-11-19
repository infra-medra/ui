import { Component, signal } from '@angular/core';
import { CarouselComponent } from '@medra/ui';

interface WorkshopTool {
  readonly name: string;
  readonly category: string;
  readonly priceLabel: string;
}

@Component({
  selector: 'app-carousel-vertical-demo',
  imports: [CarouselComponent],
  templateUrl: './carousel-vertical.demo.html',
})
export class CarouselVerticalDemo {
  protected readonly tools: WorkshopTool[] = [
    { name: 'Hand plane', category: 'Woodworking', priceLabel: '$38' },
    { name: 'Coping saw', category: 'Woodworking', priceLabel: '$14' },
    { name: 'Digital caliper', category: 'Measuring', priceLabel: '$22' },
    { name: 'Bench vise', category: 'Fixturing', priceLabel: '$61' },
    { name: 'Rotary tool', category: 'Power tools', priceLabel: '$47' },
  ];

  protected readonly page = signal(0);
}
