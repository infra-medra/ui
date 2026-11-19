import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CascadeSelectComponent, FloatLabelComponent, FloatLabelTextDirective } from '@medra/ui';
import { CASCADE_SELECT_CATALOG } from './cascade-select-demo-data';

@Component({
  selector: 'app-cascade-select-float-label-demo',
  imports: [FormsModule, CascadeSelectComponent, FloatLabelComponent, FloatLabelTextDirective],
  templateUrl: './cascade-select-float-label.demo.html',
})
export class CascadeSelectFloatLabelDemo {
  protected readonly catalog = CASCADE_SELECT_CATALOG;
  protected item: string | null = null;
}
