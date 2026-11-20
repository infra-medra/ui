import { Component } from '@angular/core';
import { DataTableComponent, TableColumnComponent } from '@medra.dev/ui';

interface EquipmentItem {
  readonly name: string;
  readonly category: string;
  readonly quantity: number;
}

@Component({
  selector: 'app-data-table-sort-multiple-demo',
  imports: [DataTableComponent, TableColumnComponent],
  templateUrl: './data-table-sort-multiple.demo.html',
})
export class DataTableSortMultipleDemo {
  protected readonly equipment: EquipmentItem[] = [
    { name: 'Oscilloscope', category: 'Test equipment', quantity: 4 },
    { name: 'Soldering station', category: 'Workbench tools', quantity: 12 },
    { name: 'Multimeter', category: 'Test equipment', quantity: 0 },
    { name: '3D printer', category: 'Fabrication', quantity: 2 },
    { name: 'Logic analyzer', category: 'Test equipment', quantity: 3 },
    { name: 'Bench power supply', category: 'Workbench tools', quantity: 6 },
    { name: 'Laser cutter', category: 'Fabrication', quantity: 1 },
    { name: 'Reflow oven', category: 'Fabrication', quantity: 0 },
  ];
}
