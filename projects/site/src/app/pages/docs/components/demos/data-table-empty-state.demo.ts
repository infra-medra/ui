import { Component } from '@angular/core';
import { DataTableComponent, TableColumnComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-data-table-empty-state-demo',
  imports: [DataTableComponent, TableColumnComponent],
  templateUrl: './data-table-empty-state.demo.html',
})
export class DataTableEmptyStateDemo {
}
