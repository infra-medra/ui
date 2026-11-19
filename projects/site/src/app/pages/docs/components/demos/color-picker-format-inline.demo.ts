import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ColorPickerComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-color-picker-format-inline-demo',
  imports: [FormsModule, ColorPickerComponent],
  templateUrl: './color-picker-format-inline.demo.html',
})
export class ColorPickerFormatInlineDemo {
  protected rgbColor = 'rgb(59, 130, 246)';
  protected inlineColor = '#22c55e';
}
