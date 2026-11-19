import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputGroupAddonDirective, InputGroupComponent, InputTextDirective } from '@medra.dev/ui';

@Component({
  selector: 'app-input-group-basic-demo',
  imports: [FormsModule, InputGroupComponent, InputGroupAddonDirective, InputTextDirective],
  templateUrl: './input-group-basic.demo.html',
})
export class InputGroupBasicDemo {
  protected price = '';
}
