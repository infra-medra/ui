import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CascadeSelectComponent } from '@medra/ui';
import { CASCADE_SELECT_CATALOG } from './cascade-select-demo-data';

@Component({
  selector: 'app-cascade-select-invalid-demo',
  imports: [FormsModule, CascadeSelectComponent],
  templateUrl: './cascade-select-invalid.demo.html',
})
export class CascadeSelectInvalidDemo {
  protected readonly catalog = CASCADE_SELECT_CATALOG;
  protected item: string | null = null;
}
