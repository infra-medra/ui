import { Component } from '@angular/core';
import { CarouselComponent, type CarouselResponsiveOption } from '@medra/ui';

interface WorkshopTool {
  readonly name: string;
  readonly category: string;
  readonly priceLabel: string;
}

@Component({
  selector: 'app-carousel-responsive-demo',
  imports: [CarouselComponent],
  templateUrl: './carousel-responsive.demo.html',
})
export class CarouselResponsiveDemo {
  protected readonly tools: WorkshopTool[] = [
    { name: 'Hand plane', category: 'Woodworking', priceLabel: '$38' },
    { name: 'Coping saw', category: 'Woodworking', priceLabel: '$14' },
    { name: 'Digital caliper', category: 'Measuring', priceLabel: '$22' },
    { name: 'Bench vise', category: 'Fixturing', priceLabel: '$61' },
    { name: 'Rotary tool', category: 'Power tools', priceLabel: '$47' },
    { name: 'Feather boards', category: 'Fixturing', priceLabel: '$19' },
  ];

  protected readonly responsiveOptions: readonly CarouselResponsiveOption[] = [
    { breakpoint: '1024px', numVisible: 2, numScroll: 2 },
    { breakpoint: '640px', numVisible: 1, numScroll: 1 },
  ];
}
