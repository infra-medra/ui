import { Component } from '@angular/core';
import { DataTableComponent, TableColumnComponent } from '@medra.dev/ui';

interface EquipmentItem {
  readonly id: number;
  readonly name: string;
  readonly category: string;
  readonly location: string;
  readonly supplier: string;
  readonly serial: string;
  readonly quantity: number;
}

@Component({
  selector: 'app-data-table-scroll-horizontal-demo',
  imports: [DataTableComponent, TableColumnComponent],
  templateUrl: './data-table-scroll-horizontal.demo.html',
})
export class DataTableScrollHorizontalDemo {
  protected readonly equipment: EquipmentItem[] = [
    { id: 1, name: 'Oscilloscope', category: 'Test equipment', location: 'Lab A', supplier: 'Keysight', serial: 'OSC-1001', quantity: 4 },
    { id: 2, name: 'Soldering station', category: 'Workbench tools', location: 'Lab B', supplier: 'Weller', serial: 'SLD-2002', quantity: 12 },
    { id: 3, name: 'Multimeter', category: 'Test equipment', location: 'Lab A', supplier: 'Fluke', serial: 'MUL-3003', quantity: 0 },
    { id: 4, name: '3D printer', category: 'Fabrication', location: 'Workshop', supplier: 'Prusa', serial: 'PRT-4004', quantity: 2 },
  ];
}
