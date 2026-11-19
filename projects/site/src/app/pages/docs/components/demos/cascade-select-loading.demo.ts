import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CascadeSelectComponent } from '@medra/ui';
import { CASCADE_SELECT_CATALOG } from './cascade-select-demo-data';

@Component({
  selector: 'app-cascade-select-loading-demo',
  imports: [FormsModule, CascadeSelectComponent],
  templateUrl: './cascade-select-loading.demo.html',
})
export class CascadeSelectLoadingDemo {
  protected readonly catalog = CASCADE_SELECT_CATALOG;
  protected item: string | null = null;
}
