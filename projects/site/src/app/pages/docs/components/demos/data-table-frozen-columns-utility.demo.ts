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
  readonly status: string;
}

@Component({
  selector: 'app-data-table-frozen-columns-utility-demo',
  imports: [DataTableComponent, TableColumnComponent],
  templateUrl: './data-table-frozen-columns-utility.demo.html',
})
export class DataTableFrozenColumnsUtilityDemo {
  protected selected: EquipmentItem[] = [];

  protected readonly equipment: EquipmentItem[] = [
    { id: 1, name: 'Oscilloscope', category: 'Test equipment', location: 'Lab A', supplier: 'Keysight', serial: 'OSC-1001', quantity: 4, status: 'In stock' },
    { id: 2, name: 'Soldering station', category: 'Workbench tools', location: 'Lab B', supplier: 'Weller', serial: 'SLD-2002', quantity: 12, status: 'In stock' },
    { id: 3, name: 'Multimeter', category: 'Test equipment', location: 'Lab A', supplier: 'Fluke', serial: 'MUL-3003', quantity: 0, status: 'Out of stock' },
    { id: 4, name: '3D printer', category: 'Fabrication', location: 'Workshop', supplier: 'Prusa', serial: 'PRT-4004', quantity: 2, status: 'Low stock' },
    { id: 5, name: 'Logic analyzer', category: 'Test equipment', location: 'Lab A', supplier: 'Saleae', serial: 'LGC-5005', quantity: 3, status: 'In stock' },
    { id: 6, name: 'Bench power supply', category: 'Workbench tools', location: 'Lab B', supplier: 'Rigol', serial: 'PWR-6006', quantity: 6, status: 'In stock' },
  ];
}
