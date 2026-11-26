import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SliderComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-slider-custom-demo',
  imports: [FormsModule, SliderComponent],
  templateUrl: './slider-custom.demo.html',
})
export class SliderCustomDemo {
  protected progress = 65;
}
