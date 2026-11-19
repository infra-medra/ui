import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SliderComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-slider-basic-demo',
  imports: [FormsModule, SliderComponent],
  templateUrl: './slider-basic.demo.html',
})
export class SliderBasicDemo {
  protected brightness = 60;
}
