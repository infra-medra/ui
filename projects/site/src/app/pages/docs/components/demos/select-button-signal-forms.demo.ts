import { Component, signal } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { SelectButtonComponent, type SelectOption } from '@medra.dev/ui';

@Component({
  selector: 'app-select-button-signal-forms-demo',
  imports: [FormField, SelectButtonComponent],
  templateUrl: './select-button-signal-forms.demo.html',
})
export class SelectButtonSignalFormsDemo {
  protected readonly planOptions: SelectOption<'free' | 'pro' | 'enterprise'>[] = [
    { label: 'Free', value: 'free' },
    { label: 'Pro', value: 'pro' },
    { label: 'Enterprise', value: 'enterprise' },
  ];
  private readonly model = signal<{ plan: 'free' | 'pro' | 'enterprise' | null }>({ plan: 'free' });
  protected readonly planForm = form(this.model);
  protected readonly current = () => this.model().plan;
}
