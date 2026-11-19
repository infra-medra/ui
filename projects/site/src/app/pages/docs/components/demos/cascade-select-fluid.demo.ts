import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CascadeSelectComponent } from '@medra/ui';
import { CASCADE_SELECT_CATALOG } from './cascade-select-demo-data';

@Component({
  selector: 'app-cascade-select-fluid-demo',
  imports: [FormsModule, CascadeSelectComponent],
  templateUrl: './cascade-select-fluid.demo.html',
})
export class CascadeSelectFluidDemo {
  protected readonly catalog = CASCADE_SELECT_CATALOG;
  protected item: string | null = null;
}
