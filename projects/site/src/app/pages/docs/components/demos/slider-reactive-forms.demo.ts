import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SliderComponent, type SliderValue } from '@medra.dev/ui';

@Component({
  selector: 'app-slider-reactive-forms-demo',
  imports: [ReactiveFormsModule, SliderComponent],
  templateUrl: './slider-reactive-forms.demo.html',
})
export class SliderReactiveFormsDemo {
  protected readonly volume = new FormControl<SliderValue>(50, { nonNullable: true });
}
