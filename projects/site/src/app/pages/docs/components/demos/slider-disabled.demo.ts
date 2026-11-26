import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SliderComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-slider-disabled-demo',
  imports: [FormsModule, SliderComponent],
  templateUrl: './slider-disabled.demo.html',
})
export class SliderDisabledDemo {
  protected level = 40;
}
