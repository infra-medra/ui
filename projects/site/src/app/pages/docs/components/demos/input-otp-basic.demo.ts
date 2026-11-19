import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputOtpComponent } from '@medra/ui';

@Component({
  selector: 'app-input-otp-basic-demo',
  imports: [FormsModule, InputOtpComponent],
  templateUrl: './input-otp-basic.demo.html',
})
export class InputOtpBasicDemo {
  protected code = '';
}
