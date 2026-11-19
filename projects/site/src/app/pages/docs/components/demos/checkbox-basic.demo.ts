import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxComponent } from '@medra/ui';

@Component({
  selector: 'app-checkbox-basic-demo',
  imports: [FormsModule, CheckboxComponent],
  templateUrl: './checkbox-basic.demo.html',
})
export class CheckboxBasicDemo {
  protected subscribed = false;
}
