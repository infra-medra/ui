import { Component } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputChipsComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-input-chips-basic-demo',
  imports: [FormsModule, JsonPipe, InputChipsComponent],
  templateUrl: './input-chips-basic.demo.html',
})
export class InputChipsBasicDemo {
  protected tags: string[] = ['angular', 'signals'];
}
