import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-date-picker-inline-demo',
  imports: [FormsModule, DatePickerComponent],
  templateUrl: './date-picker-inline.demo.html',
})
export class DatePickerInlineDemo {
  protected date: Date | null = null;
}
