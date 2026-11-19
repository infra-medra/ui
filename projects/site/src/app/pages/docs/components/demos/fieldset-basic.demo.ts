import { Component, signal } from '@angular/core';
import { ButtonDirective, FieldsetComponent, InputTextDirective } from '@medra/ui';

@Component({
  selector: 'app-fieldset-basic-demo',
  imports: [ButtonDirective, FieldsetComponent, InputTextDirective],
  templateUrl: './fieldset-basic.demo.html',
})
export class FieldsetBasicDemo {
  protected readonly collapsed = signal(false);
}
