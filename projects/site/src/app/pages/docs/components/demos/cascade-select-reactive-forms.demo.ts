import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CascadeSelectComponent } from '@medra/ui';
import { CASCADE_SELECT_CATALOG } from './cascade-select-demo-data';

@Component({
  selector: 'app-cascade-select-reactive-forms-demo',
  imports: [ReactiveFormsModule, CascadeSelectComponent],
  templateUrl: './cascade-select-reactive-forms.demo.html',
})
export class CascadeSelectReactiveFormsDemo {
  protected readonly catalog = CASCADE_SELECT_CATALOG;
  protected readonly product = new FormControl<string | null>(null, Validators.required);
}
