import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KnobComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-knob-basic-demo',
  imports: [FormsModule, KnobComponent],
  templateUrl: './knob-basic.demo.html',
})
export class KnobBasicDemo {
  protected volume = 40;
}
