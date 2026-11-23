import { Component } from '@angular/core';
import { DataTableComponent, TableColumnComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-data-table-empty-template-demo',
  imports: [DataTableComponent, TableColumnComponent],
  templateUrl: './data-table-empty-template.demo.html',
})
export class DataTableEmptyTemplateDemo {}
