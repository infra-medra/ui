import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePickerComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-date-picker-reactive-forms-demo',
  imports: [ReactiveFormsModule, DatePickerComponent],
  templateUrl: './date-picker-reactive-forms.demo.html',
})
export class DatePickerReactiveFormsDemo {
  protected readonly dateControl = new FormControl<Date | null>(null, Validators.required);
}
