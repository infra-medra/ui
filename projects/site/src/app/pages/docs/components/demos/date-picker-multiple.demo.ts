import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-date-picker-multiple-demo',
  imports: [FormsModule, DatePickerComponent],
  templateUrl: './date-picker-multiple.demo.html',
})
export class DatePickerMultipleDemo {
  protected dates: readonly Date[] = [];
}
