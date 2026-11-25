import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumberComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-input-number-template-driven-demo',
  imports: [FormsModule, InputNumberComponent],
  templateUrl: './input-number-template-driven.demo.html',
})
export class InputNumberTemplateDrivenDemo {
  protected quantity: number | null = null;
}
