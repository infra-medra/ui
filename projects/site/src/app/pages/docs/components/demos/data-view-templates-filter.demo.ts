import { Component } from '@angular/core';
import { DataViewComponent } from '@medra.dev/ui';

interface Recipe {
  readonly title: string;
  readonly cuisine: string;
  readonly minutes: number;
}

@Component({
  selector: 'app-data-view-templates-filter-demo',
  imports: [DataViewComponent],
  templateUrl: './data-view-templates-filter.demo.html',
})
export class DataViewTemplatesFilterDemo {
  protected readonly recipes: Recipe[] = [
    { title: 'Roasted squash soup', cuisine: 'Comfort food', minutes: 35 },
    { title: 'Lemon herb chicken', cuisine: 'Mediterranean', minutes: 40 },
    { title: 'Spicy peanut noodles', cuisine: 'Southeast Asian', minutes: 20 },
    { title: 'Mushroom risotto', cuisine: 'Italian', minutes: 45 },
    { title: 'Black bean tacos', cuisine: 'Mexican', minutes: 25 },
    { title: 'Miso glazed salmon', cuisine: 'Japanese', minutes: 30 },
  ];

  protected readonly filterPredicate = (item: Recipe, query: string): boolean =>
    item.title.toLowerCase().includes(query.toLowerCase()) || item.cuisine.toLowerCase().includes(query.toLowerCase());
}
