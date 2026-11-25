import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-date-picker-drilldown-demo',
  imports: [FormsModule, DatePickerComponent],
  templateUrl: './date-picker-drilldown.demo.html',
})
export class DatePickerDrilldownDemo {
  protected date: Date | null = null;
}
