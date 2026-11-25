import { Component, signal } from '@angular/core';
import { ButtonDirective, IconComponent, ProgressSpinnerComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-button-loading-demo',
  imports: [ButtonDirective, IconComponent, ProgressSpinnerComponent],
  templateUrl: './button-loading.demo.html',
})
export class ButtonLoadingDemo {
  protected readonly loading = signal(false);

  protected load(): void {
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 2000);
  }
}
