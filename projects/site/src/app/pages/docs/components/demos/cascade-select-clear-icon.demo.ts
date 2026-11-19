import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CascadeSelectComponent } from '@medra/ui';
import { CASCADE_SELECT_CATALOG } from './cascade-select-demo-data';

@Component({
  selector: 'app-cascade-select-clear-icon-demo',
  imports: [FormsModule, CascadeSelectComponent],
  templateUrl: './cascade-select-clear-icon.demo.html',
})
export class CascadeSelectClearIconDemo {
  protected readonly catalog = CASCADE_SELECT_CATALOG;
  protected item: string | null = null;
}
