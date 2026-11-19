import { Component, signal } from '@angular/core';
import { DataViewComponent } from '@medra/ui';

interface Recipe {
  readonly title: string;
  readonly cuisine: string;
  readonly minutes: number;
}

@Component({
  selector: 'app-data-view-basic-demo',
  imports: [DataViewComponent],
  templateUrl: './data-view-basic.demo.html',
})
export class DataViewBasicDemo {
  protected readonly layout = signal<'list' | 'grid'>('list');

  protected readonly recipes: Recipe[] = [
    { title: 'Roasted squash soup', cuisine: 'Comfort food', minutes: 35 },
    { title: 'Lemon herb chicken', cuisine: 'Mediterranean', minutes: 40 },
    { title: 'Spicy peanut noodles', cuisine: 'Southeast Asian', minutes: 20 },
    { title: 'Mushroom risotto', cuisine: 'Italian', minutes: 45 },
    { title: 'Black bean tacos', cuisine: 'Mexican', minutes: 25 },
    { title: 'Miso glazed salmon', cuisine: 'Japanese', minutes: 30 },
    { title: 'Chickpea curry', cuisine: 'Indian', minutes: 38 },
    { title: 'Caprese salad', cuisine: 'Italian', minutes: 10 },
    { title: 'Beef and broccoli stir-fry', cuisine: 'Chinese', minutes: 22 },
  ];

  protected toggleLayout(): void {
    this.layout.set(this.layout() === 'list' ? 'grid' : 'list');
  }
}
