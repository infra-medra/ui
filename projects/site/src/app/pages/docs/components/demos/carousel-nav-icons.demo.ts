import { Component } from '@angular/core';
import { CarouselComponent, IconComponent } from '@medra.dev/ui';

interface WorkshopTool {
  readonly name: string;
  readonly category: string;
  readonly priceLabel: string;
}

@Component({
  selector: 'app-carousel-nav-icons-demo',
  imports: [CarouselComponent, IconComponent],
  templateUrl: './carousel-nav-icons.demo.html',
})
export class CarouselNavIconsDemo {
  protected readonly tools: WorkshopTool[] = [
    { name: 'Hand plane', category: 'Woodworking', priceLabel: '$38' },
    { name: 'Coping saw', category: 'Woodworking', priceLabel: '$14' },
    { name: 'Digital caliper', category: 'Measuring', priceLabel: '$22' },
    { name: 'Bench vise', category: 'Fixturing', priceLabel: '$61' },
  ];
}
