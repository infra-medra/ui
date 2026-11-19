import { Component, signal } from '@angular/core';
import { ProgressBarComponent } from '@medra/ui';

@Component({
  selector: 'app-progress-bar-unit-demo',
  imports: [ProgressBarComponent],
  templateUrl: './progress-bar-unit.demo.html',
})
export class ProgressBarUnitDemo {
  protected readonly downloaded = signal(64);
}
