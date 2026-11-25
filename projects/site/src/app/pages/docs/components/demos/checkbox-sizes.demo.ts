import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-checkbox-sizes-demo',
  imports: [FormsModule, CheckboxComponent],
  templateUrl: './checkbox-sizes.demo.html',
})
export class CheckboxSizesDemo {
  protected small = false;
  protected normal = true;
  protected large = true;
}
