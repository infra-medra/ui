import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-date-picker-clear-icon-demo',
  imports: [FormsModule, DatePickerComponent],
  templateUrl: './date-picker-clear-icon.demo.html',
})
export class DatePickerClearIconDemo {
  protected date: Date | null = new Date(2026, 4, 10);
}
