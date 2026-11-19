import { Component, signal } from '@angular/core';
import { ButtonDirective, MessageComponent } from '@medra/ui';

@Component({
  selector: 'app-message-customization-demo',
  imports: [MessageComponent, ButtonDirective],
  templateUrl: './message-customization.demo.html',
})
export class MessageCustomizationDemo {
  protected readonly lifeVisible = signal(true);
}
