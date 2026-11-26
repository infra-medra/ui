import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SliderComponent, type SliderRange } from '@medra.dev/ui';

@Component({
  selector: 'app-slider-range-demo',
  imports: [FormsModule, SliderComponent],
  templateUrl: './slider-range.demo.html',
})
export class SliderRangeDemo {
  protected budget: SliderRange = { start: 20, end: 80 };
}
