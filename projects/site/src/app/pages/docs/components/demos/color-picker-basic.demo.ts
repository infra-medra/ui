import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ColorPickerComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-color-picker-basic-demo',
  imports: [FormsModule, ColorPickerComponent],
  templateUrl: './color-picker-basic.demo.html',
})
export class ColorPickerBasicDemo {
  protected accentColor = '#3b82f6';
}
