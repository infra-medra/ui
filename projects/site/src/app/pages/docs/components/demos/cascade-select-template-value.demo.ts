import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CascadeSelectComponent } from '@medra/ui';
import { CASCADE_SELECT_CATALOG } from './cascade-select-demo-data';

@Component({
  selector: 'app-cascade-select-template-value-demo',
  imports: [FormsModule, CascadeSelectComponent],
  templateUrl: './cascade-select-template-value.demo.html',
})
export class CascadeSelectTemplateValueDemo {
  protected readonly catalog = CASCADE_SELECT_CATALOG;
  protected item: string | null = null;
}
