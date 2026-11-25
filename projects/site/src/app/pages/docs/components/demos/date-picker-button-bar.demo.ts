import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-date-picker-button-bar-demo',
  imports: [FormsModule, DatePickerComponent],
  templateUrl: './date-picker-button-bar.demo.html',
})
export class DatePickerButtonBarDemo {
  protected date: Date | null = null;
}
