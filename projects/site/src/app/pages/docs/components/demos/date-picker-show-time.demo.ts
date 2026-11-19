import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-date-picker-show-time-demo',
  imports: [FormsModule, DatePickerComponent],
  templateUrl: './date-picker-show-time.demo.html',
})
export class DatePickerShowTimeDemo {
  protected appointment: Date | null = null;
}
