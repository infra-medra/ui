import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-date-picker-fluid-demo',
  imports: [FormsModule, DatePickerComponent],
  templateUrl: './date-picker-fluid.demo.html',
})
export class DatePickerFluidDemo {
  protected date: Date | null = null;
}
