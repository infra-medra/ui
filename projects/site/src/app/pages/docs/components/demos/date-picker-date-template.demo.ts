import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-date-picker-date-template-demo',
  imports: [FormsModule, DatePickerComponent],
  templateUrl: './date-picker-date-template.demo.html',
})
export class DatePickerDateTemplateDemo {
  protected selectedDate: Date | null = null;
}
