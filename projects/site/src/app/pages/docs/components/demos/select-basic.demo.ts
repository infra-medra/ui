import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectComponent, type SelectOption } from '@medra/ui';

@Component({
  selector: 'app-select-basic-demo',
  imports: [FormsModule, SelectComponent],
  templateUrl: './select-basic.demo.html',
})
export class SelectBasicDemo {
  protected readonly plans: SelectOption<string>[] = [
    { label: 'Free', value: 'free' },
    { label: 'Starter', value: 'starter' },
    { label: 'Pro', value: 'pro' },
    { label: 'Enterprise', value: 'enterprise', disabled: true },
  ];

  protected plan: string | null = 'starter';
}
