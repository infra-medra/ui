import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToggleButtonComponent } from '@medra/ui';

@Component({
  selector: 'app-toggle-button-basic-demo',
  imports: [FormsModule, ToggleButtonComponent],
  templateUrl: './toggle-button-basic.demo.html',
})
export class ToggleButtonBasicDemo {
  protected isPublic = false;
}
