import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxComponent } from '@medra/ui';

@Component({
  selector: 'app-checkbox-states-demo',
  imports: [FormsModule, CheckboxComponent],
  templateUrl: './checkbox-states.demo.html',
})
export class CheckboxStatesDemo {
  protected readonlyChecked = true;
}
