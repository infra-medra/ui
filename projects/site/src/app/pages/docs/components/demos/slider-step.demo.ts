import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SliderComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-slider-step-demo',
  imports: [FormsModule, SliderComponent],
  templateUrl: './slider-step.demo.html',
})
export class SliderStepDemo {
  protected opacity = 40;
}
