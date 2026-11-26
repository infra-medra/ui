import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonDirective, SliderComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-slider-controlled-demo',
  imports: [FormsModule, ButtonDirective, SliderComponent],
  templateUrl: './slider-controlled.demo.html',
})
export class SliderControlledDemo {
  protected value = 50;

  protected nudge(delta: number): void {
    this.value = Math.min(100, Math.max(0, this.value + delta));
  }
}
