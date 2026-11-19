import { Component, signal } from '@angular/core';
import { DataViewComponent } from '@medra.dev/ui';

interface Recipe {
  readonly title: string;
  readonly minutes: number;
}

@Component({
  selector: 'app-data-view-lazy-demo',
  imports: [DataViewComponent],
  templateUrl: './data-view-lazy.demo.html',
})
export class DataViewLazyDemo {
  private readonly serverRecipes: Recipe[] = Array.from({ length: 23 }, (_, i) => ({
    title: `Recipe ${i + 1}`,
    minutes: 15 + (i % 6) * 5,
  }));

  protected readonly recipes = signal<Recipe[]>([]);
  protected readonly loading = signal(false);

  protected onLazyLoad(range: { first: number; rows: number }): void {
    this.loading.set(true);
    setTimeout(() => {
      this.recipes.set(this.serverRecipes.slice(range.first, range.first + range.rows));
      this.loading.set(false);
    }, 500);
  }
}
