import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SliderComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-slider-invalid-demo',
  imports: [FormsModule, SliderComponent],
  templateUrl: './slider-invalid.demo.html',
})
export class SliderInvalidDemo {
  protected threshold = 90;
}
