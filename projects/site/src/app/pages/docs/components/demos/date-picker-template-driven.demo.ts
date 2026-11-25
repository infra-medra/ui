import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-date-picker-template-driven-demo',
  imports: [FormsModule, DatePickerComponent],
  templateUrl: './date-picker-template-driven.demo.html',
})
export class DatePickerTemplateDrivenDemo {
  protected meetingDate: Date | null = null;
}
