import { Component } from '@angular/core';
import { InlineMessageComponent, InputTextDirective } from '@medra.dev/ui';

@Component({
  selector: 'app-inline-message-basic-demo',
  imports: [InlineMessageComponent, InputTextDirective],
  templateUrl: './inline-message-basic.demo.html',
})
export class InlineMessageBasicDemo {}
