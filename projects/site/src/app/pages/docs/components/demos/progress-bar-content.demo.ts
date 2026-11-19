import { Component } from '@angular/core';
import { ProgressBarComponent } from '@medra/ui';

@Component({
  selector: 'app-progress-bar-content-demo',
  imports: [ProgressBarComponent],
  templateUrl: './progress-bar-content.demo.html',
})
export class ProgressBarContentDemo {
  protected readonly value = 64;
}
