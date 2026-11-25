import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerComponent, IftaLabelComponent, IftaLabelTextDirective } from '@medra.dev/ui';

@Component({
  selector: 'app-date-picker-ifta-label-demo',
  imports: [FormsModule, DatePickerComponent, IftaLabelComponent, IftaLabelTextDirective],
  templateUrl: './date-picker-ifta-label.demo.html',
})
export class DatePickerIftaLabelDemo {
  protected date: Date | null = null;
}
