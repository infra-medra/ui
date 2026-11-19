import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent, IconFieldComponent, IconFieldIconDirective, InputTextDirective } from '@medra/ui';

@Component({
  selector: 'app-icon-field-basic-demo',
  imports: [FormsModule, IconComponent, IconFieldComponent, IconFieldIconDirective, InputTextDirective],
  templateUrl: './icon-field-basic.demo.html',
})
export class IconFieldBasicDemo {
  protected email = '';
  protected password = '';
}
