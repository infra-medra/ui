import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RadioButtonComponent } from '@medra.dev/ui';

interface PlanOption {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly price: string;
}

@Component({
  selector: 'app-radio-button-card-demo',
  imports: [FormsModule, RadioButtonComponent],
  templateUrl: './radio-button-card.demo.html',
})
export class RadioButtonCardDemo {
  protected readonly plans: readonly PlanOption[] = [
    { id: 'starter', name: 'Starter', description: 'Essential tools for small side projects.', price: '$0/mo' },
    { id: 'growth', name: 'Growth', description: 'Shared workspaces and priority builds.', price: '$24/mo' },
    { id: 'scale', name: 'Scale', description: 'Dedicated support and custom SLAs.', price: '$79/mo' },
  ];
  protected selectedPlan = 'Starter';
}
