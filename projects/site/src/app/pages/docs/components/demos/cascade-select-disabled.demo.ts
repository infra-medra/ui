import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CascadeSelectComponent } from '@medra/ui';
import { CASCADE_SELECT_CATALOG } from './cascade-select-demo-data';

@Component({
  selector: 'app-cascade-select-disabled-demo',
  imports: [FormsModule, CascadeSelectComponent],
  templateUrl: './cascade-select-disabled.demo.html',
})
export class CascadeSelectDisabledDemo {
  protected readonly catalog = CASCADE_SELECT_CATALOG;
  protected item: string | null = null;
}
