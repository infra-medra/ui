import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CascadeSelectComponent } from '@medra.dev/ui';
import { CASCADE_SELECT_CATALOG } from './cascade-select-demo-data';

@Component({
  selector: 'app-cascade-select-template-driven-demo',
  imports: [FormsModule, CascadeSelectComponent],
  templateUrl: './cascade-select-template-driven.demo.html',
})
export class CascadeSelectTemplateDrivenDemo {
  protected readonly catalog = CASCADE_SELECT_CATALOG;
  protected item: string | null = null;
}
