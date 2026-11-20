import { Component } from '@angular/core';
import { ButtonDirective, DataTableComponent, TableColumnComponent } from '@medra.dev/ui';

interface EquipmentItem {
  readonly id: number;
  readonly name: string;
  readonly category: string;
  readonly quantity: number;
  readonly status: 'In stock' | 'Low stock' | 'Out of stock';
}

@Component({
  selector: 'app-data-table-row-group-rowspan-demo',
  imports: [DataTableComponent, TableColumnComponent, ButtonDirective],
  templateUrl: './data-table-row-group-rowspan.demo.html',
})
export class DataTableRowGroupRowspanDemo {
  protected readonly equipment: EquipmentItem[] = [
    { id: 1, name: 'Oscilloscope', category: 'Test equipment', quantity: 4, status: 'In stock' },
    { id: 2, name: 'Multimeter', category: 'Test equipment', quantity: 0, status: 'Out of stock' },
    { id: 3, name: 'Logic analyzer', category: 'Test equipment', quantity: 3, status: 'In stock' },
    { id: 4, name: 'Soldering station', category: 'Workbench tools', quantity: 12, status: 'In stock' },
    { id: 5, name: 'Bench power supply', category: 'Workbench tools', quantity: 6, status: 'In stock' },
    { id: 6, name: '3D printer', category: 'Fabrication', quantity: 2, status: 'Low stock' },
    { id: 7, name: 'Laser cutter', category: 'Fabrication', quantity: 1, status: 'Low stock' },
  ];
}
