import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InplaceComponent, InplaceContentDirective, InplaceDisplayDirective, InputTextDirective } from '@medra.dev/ui';

@Component({
  selector: 'app-inplace-basic-demo',
  imports: [FormsModule, InplaceComponent, InplaceContentDirective, InplaceDisplayDirective, InputTextDirective],
  templateUrl: './inplace-basic.demo.html',
})
export class InplaceBasicDemo {
  protected readonly name = signal('');
}
