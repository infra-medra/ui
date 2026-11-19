import { Component, signal } from '@angular/core';
import { ProgressBarComponent } from '@medra/ui';

@Component({
  selector: 'app-progress-bar-basic-demo',
  imports: [ProgressBarComponent],
  templateUrl: './progress-bar-basic.demo.html',
})
export class ProgressBarBasicDemo {
  protected readonly value = signal(42);
}
