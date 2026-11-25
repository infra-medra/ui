import { Component, signal } from '@angular/core';
import { ButtonDirective, DialogComponent, IconComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-dialog-template-demo',
  imports: [ButtonDirective, DialogComponent, IconComponent],
  templateUrl: './dialog-template.demo.html',
})
export class DialogTemplateDemo {
  protected readonly visible = signal(false);
}
