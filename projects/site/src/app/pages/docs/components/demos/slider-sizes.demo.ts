import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SliderComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-slider-sizes-demo',
  imports: [FormsModule, SliderComponent],
  templateUrl: './slider-sizes.demo.html',
})
export class SliderSizesDemo {
  protected small = 30;
  protected medium = 50;
  protected large = 70;
}
