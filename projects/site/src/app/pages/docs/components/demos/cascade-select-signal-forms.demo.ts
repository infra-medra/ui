import { Component, signal } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { CascadeSelectComponent } from '@medra/ui';
import { CASCADE_SELECT_CATALOG } from './cascade-select-demo-data';

@Component({
  selector: 'app-cascade-select-signal-forms-demo',
  imports: [FormField, CascadeSelectComponent],
  templateUrl: './cascade-select-signal-forms.demo.html',
})
export class CascadeSelectSignalFormsDemo {
  protected readonly catalog = CASCADE_SELECT_CATALOG;
  private readonly model = signal<{ product: string | null }>({ product: null });
  protected readonly productForm = form(this.model);
  protected readonly current = () => this.model().product;
}
