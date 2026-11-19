import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PasswordComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-password-basic-demo',
  imports: [FormsModule, PasswordComponent],
  templateUrl: './password-basic.demo.html',
})
export class PasswordBasicDemo {
  protected password = '';
}
