import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SliderComponent, type SliderRange } from '@medra.dev/ui';

@Component({
  selector: 'app-slider-vertical-demo',
  imports: [FormsModule, SliderComponent],
  templateUrl: './slider-vertical.demo.html',
})
export class SliderVerticalDemo {
  protected volume = 50;
  protected band: SliderRange = { start: 30, end: 70 };
}
