import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent, IconFieldComponent, IconFieldIconDirective, InputTextDirective } from '@medra.dev/ui';

@Component({
  selector: 'app-input-text-clear-icon-demo',
  imports: [FormsModule, InputTextDirective, IconFieldComponent, IconFieldIconDirective, IconComponent],
  templateUrl: './input-text-clear-icon.demo.html',
})
export class InputTextClearIconDemo {
  protected value = 'Medra UI';
}
