import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-date-picker-filled-demo',
  imports: [FormsModule, DatePickerComponent],
  templateUrl: './date-picker-filled.demo.html',
})
export class DatePickerFilledDemo {
  protected date: Date | null = null;
}
