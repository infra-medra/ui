import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToggleSwitchComponent } from '@medra/ui';

@Component({
  selector: 'app-toggle-switch-basic-demo',
  imports: [FormsModule, ToggleSwitchComponent],
  templateUrl: './toggle-switch-basic.demo.html',
})
export class ToggleSwitchBasicDemo {
  protected notificationsEnabled = true;
}
