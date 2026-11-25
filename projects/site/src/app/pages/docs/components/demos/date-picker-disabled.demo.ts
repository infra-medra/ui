import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-date-picker-disabled-demo',
  imports: [FormsModule, DatePickerComponent],
  templateUrl: './date-picker-disabled.demo.html',
})
export class DatePickerDisabledDemo {
  protected date: Date | null = new Date(2026, 4, 10);
}
