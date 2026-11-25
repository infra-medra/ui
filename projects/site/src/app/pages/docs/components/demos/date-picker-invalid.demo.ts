import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-date-picker-invalid-demo',
  imports: [FormsModule, DatePickerComponent],
  templateUrl: './date-picker-invalid.demo.html',
})
export class DatePickerInvalidDemo {
  protected date: Date | null = null;
}
