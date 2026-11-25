import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectButtonComponent, type SelectOption } from '@medra.dev/ui';

@Component({
  selector: 'app-select-button-disabled-demo',
  imports: [FormsModule, SelectButtonComponent],
  templateUrl: './select-button-disabled.demo.html',
})
export class SelectButtonDisabledDemo {
  protected readonly stateOptions: SelectOption<'off' | 'on'>[] = [
    { label: 'Off', value: 'off' },
    { label: 'On', value: 'on' },
  ];
  protected readonly tierOptions: SelectOption<'free' | 'pro' | 'enterprise'>[] = [
    { label: 'Free', value: 'free' },
    { label: 'Pro', value: 'pro' },
    { label: 'Enterprise', value: 'enterprise', disabled: true },
  ];
  protected disabledValue: 'off' | 'on' | null = 'on';
  protected tierValue: 'free' | 'pro' | 'enterprise' | null = 'free';
}
