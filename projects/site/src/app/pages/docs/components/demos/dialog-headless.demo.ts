import { Component, signal } from '@angular/core';
import { ButtonDirective, DialogComponent, IconComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-dialog-headless-demo',
  imports: [ButtonDirective, DialogComponent, IconComponent],
  templateUrl: './dialog-headless.demo.html',
})
export class DialogHeadlessDemo {
  protected readonly visible = signal(false);
}
