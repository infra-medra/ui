import { Component, signal } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { SliderComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-slider-signal-forms-demo',
  imports: [FormField, SliderComponent],
  templateUrl: './slider-signal-forms.demo.html',
})
export class SliderSignalFormsDemo {
  private readonly model = signal({ volume: 30 });
  protected readonly volumeForm = form(this.model);
  protected readonly current = () => this.model().volume;
}
