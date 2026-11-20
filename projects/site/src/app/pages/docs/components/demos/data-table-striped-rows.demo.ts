import { Component } from '@angular/core';
import { DataTableComponent, TableColumnComponent } from '@medra.dev/ui';

interface EquipmentItem {
  readonly id: number;
  readonly name: string;
  readonly category: string;
  readonly quantity: number;
}

@Component({
  selector: 'app-data-table-striped-rows-demo',
  imports: [DataTableComponent, TableColumnComponent],
  templateUrl: './data-table-striped-rows.demo.html',
})
export class DataTableStripedRowsDemo {
  protected readonly equipment: EquipmentItem[] = [
    { id: 1, name: 'Oscilloscope', category: 'Test equipment', quantity: 4 },
    { id: 2, name: 'Soldering station', category: 'Workbench tools', quantity: 12 },
    { id: 3, name: 'Multimeter', category: 'Test equipment', quantity: 9 },
    { id: 4, name: '3D printer', category: 'Fabrication', quantity: 2 },
    { id: 5, name: 'Logic analyzer', category: 'Test equipment', quantity: 3 },
  ];
}
