import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CascadeSelectComponent } from '@medra.dev/ui';
import { CASCADE_SELECT_CATALOG } from './cascade-select-demo-data';

@Component({
  selector: 'app-cascade-select-template-option-demo',
  imports: [FormsModule, CascadeSelectComponent],
  templateUrl: './cascade-select-template-option.demo.html',
})
export class CascadeSelectTemplateOptionDemo {
  protected readonly catalog = CASCADE_SELECT_CATALOG;
  protected item: string | null = null;
}
