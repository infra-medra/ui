import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-date-picker-locale-demo',
  imports: [FormsModule, DatePickerComponent],
  templateUrl: './date-picker-locale.demo.html',
})
export class DatePickerLocaleDemo {
  protected brazilDate: Date | null = null;
}
