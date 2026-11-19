import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CascadeSelectComponent, IftaLabelComponent, IftaLabelTextDirective } from '@medra.dev/ui';
import { CASCADE_SELECT_CATALOG } from './cascade-select-demo-data';

@Component({
  selector: 'app-cascade-select-ifta-label-demo',
  imports: [FormsModule, CascadeSelectComponent, IftaLabelComponent, IftaLabelTextDirective],
  templateUrl: './cascade-select-ifta-label.demo.html',
})
export class CascadeSelectIftaLabelDemo {
  protected readonly catalog = CASCADE_SELECT_CATALOG;
  protected item: string | null = null;
}
