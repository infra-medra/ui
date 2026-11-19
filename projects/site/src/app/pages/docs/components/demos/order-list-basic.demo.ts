import { Component, signal } from '@angular/core';
import { OrderListComponent } from '@medra.dev/ui';

interface DeploymentStep {
  readonly label: string;
  readonly eta: string;
}

@Component({
  selector: 'app-order-list-basic-demo',
  imports: [OrderListComponent],
  templateUrl: './order-list-basic.demo.html',
})
export class OrderListBasicDemo {
  protected readonly steps = signal<DeploymentStep[]>([
    { label: 'Run database migrations', eta: '5 min' },
    { label: 'Deploy backend services', eta: '8 min' },
    { label: 'Warm CDN cache', eta: '3 min' },
    { label: 'Run smoke tests', eta: '6 min' },
    { label: 'Flip traffic to the new version', eta: '1 min' },
  ]);

  protected readonly selection = signal<readonly DeploymentStep[]>([]);
  protected readonly disabled = signal(false);
}
