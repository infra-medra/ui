import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-checkbox-template-driven-demo',
  imports: [FormsModule, CheckboxComponent],
  templateUrl: './checkbox-template-driven.demo.html',
})
export class CheckboxTemplateDrivenDemo {
  protected accepted = false;
}
