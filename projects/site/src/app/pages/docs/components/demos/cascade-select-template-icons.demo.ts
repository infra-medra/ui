import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CascadeSelectComponent } from '@medra.dev/ui';
import { CASCADE_SELECT_CATALOG } from './cascade-select-demo-data';

@Component({
  selector: 'app-cascade-select-template-icons-demo',
  imports: [FormsModule, CascadeSelectComponent],
  templateUrl: './cascade-select-template-icons.demo.html',
})
export class CascadeSelectTemplateIconsDemo {
  protected readonly catalog = CASCADE_SELECT_CATALOG;
  protected item: string | null = null;
}
