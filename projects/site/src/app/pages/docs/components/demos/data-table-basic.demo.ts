import { Component } from '@angular/core';
import { DataTableComponent, TableColumnComponent } from '@medra/ui';

interface EquipmentItem {
  readonly name: string;
  readonly category: string;
  readonly quantity: number;
  readonly status: 'In stock' | 'Low stock' | 'Out of stock';
}

@Component({
  selector: 'app-data-table-basic-demo',
  imports: [DataTableComponent, TableColumnComponent],
  templateUrl: './data-table-basic.demo.html',
})
export class DataTableBasicDemo {
  protected readonly equipment: EquipmentItem[] = [
    { name: 'Oscilloscope', category: 'Test equipment', quantity: 4, status: 'In stock' },
    { name: 'Soldering station', category: 'Workbench tools', quantity: 12, status: 'In stock' },
    { name: 'Multimeter', category: 'Test equipment', quantity: 0, status: 'Out of stock' },
    { name: '3D printer', category: 'Fabrication', quantity: 2, status: 'Low stock' },
    { name: 'Logic analyzer', category: 'Test equipment', quantity: 3, status: 'In stock' },
    { name: 'Bench power supply', category: 'Workbench tools', quantity: 6, status: 'In stock' },
    { name: 'Laser cutter', category: 'Fabrication', quantity: 1, status: 'Low stock' },
    { name: 'Reflow oven', category: 'Fabrication', quantity: 0, status: 'Out of stock' },
  ];

  protected selectedEquipment: readonly EquipmentItem[] | null = [];
}
