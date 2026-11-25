import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-date-picker-sizes-demo',
  imports: [FormsModule, DatePickerComponent],
  templateUrl: './date-picker-sizes.demo.html',
})
export class DatePickerSizesDemo {
  protected smallDate: Date | null = null;
  protected defaultDate: Date | null = null;
  protected largeDate: Date | null = null;
}
