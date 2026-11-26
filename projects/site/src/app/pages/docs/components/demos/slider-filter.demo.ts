import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SliderComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-slider-filter-demo',
  imports: [FormsModule, SliderComponent],
  templateUrl: './slider-filter.demo.html',
})
export class SliderFilterDemo {
  protected contrast = 100;
  protected brightness = 100;
  protected sepia = 0;

  protected filter(): string {
    return `contrast(${this.contrast}%) brightness(${this.brightness}%) sepia(${this.sepia}%)`;
  }
}
