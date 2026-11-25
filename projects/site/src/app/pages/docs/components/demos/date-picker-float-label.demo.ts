import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerComponent, FloatLabelComponent, FloatLabelTextDirective } from '@medra.dev/ui';

@Component({
  selector: 'app-date-picker-float-label-demo',
  imports: [FormsModule, DatePickerComponent, FloatLabelComponent, FloatLabelTextDirective],
  templateUrl: './date-picker-float-label.demo.html',
})
export class DatePickerFloatLabelDemo {
  protected date: Date | null = null;
}
