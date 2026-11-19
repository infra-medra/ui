import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CascadeSelectComponent } from '@medra/ui';
import { CASCADE_SELECT_CATALOG } from './cascade-select-demo-data';

@Component({
  selector: 'app-cascade-select-filled-demo',
  imports: [FormsModule, CascadeSelectComponent],
  templateUrl: './cascade-select-filled.demo.html',
})
export class CascadeSelectFilledDemo {
  protected readonly catalog = CASCADE_SELECT_CATALOG;
  protected item: string | null = null;
}
