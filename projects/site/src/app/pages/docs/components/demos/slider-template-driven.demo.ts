import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SliderComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-slider-template-driven-demo',
  imports: [FormsModule, SliderComponent],
  templateUrl: './slider-template-driven.demo.html',
})
export class SliderTemplateDrivenDemo {
  protected volume = 40;
}
