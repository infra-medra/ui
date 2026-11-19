import { Component, signal } from '@angular/core';
import { MessageComponent } from '@medra/ui';

@Component({
  selector: 'app-message-basic-demo',
  imports: [MessageComponent],
  templateUrl: './message-basic.demo.html',
})
export class MessageBasicDemo {
  protected readonly visible = signal(true);
}
