import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SliderComponent, type SliderRange } from '@medra/ui';

@Component({
  selector: 'app-slider-range-constraints-demo',
  imports: [FormsModule, SliderComponent],
  templateUrl: './slider-range-constraints.demo.html',
})
export class SliderRangeConstraintsDemo {
  protected priceRange: SliderRange = { start: 20, end: 80 };
}
