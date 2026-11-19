import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KnobComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-knob-colors-template-demo',
  imports: [FormsModule, KnobComponent],
  templateUrl: './knob-colors-template.demo.html',
})
export class KnobColorsTemplateDemo {
  protected temperature = 21;
  protected readonly formatTemperature = (value: number) => `${value}°C`;
}
