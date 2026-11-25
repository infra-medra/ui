import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectButtonComponent, type SelectOption } from '@medra.dev/ui';

@Component({
  selector: 'app-select-button-template-driven-demo',
  imports: [FormsModule, SelectButtonComponent],
  templateUrl: './select-button-template-driven.demo.html',
})
export class SelectButtonTemplateDrivenDemo {
  protected readonly planOptions: SelectOption<'free' | 'pro' | 'enterprise'>[] = [
    { label: 'Free', value: 'free' },
    { label: 'Pro', value: 'pro' },
    { label: 'Enterprise', value: 'enterprise' },
  ];
  protected plan: 'free' | 'pro' | 'enterprise' | null = 'free';
}
