import { Component } from '@angular/core';
import { DataTableComponent, TableColumnComponent } from '@medra.dev/ui';

interface EquipmentItem {
  readonly id: number;
  readonly name: string;
  readonly category: string;
  readonly quantity: number;
  readonly status: 'In stock' | 'Low stock' | 'Out of stock';
}

@Component({
  selector: 'app-data-table-cell-class-demo',
  imports: [DataTableComponent, TableColumnComponent],
  templateUrl: './data-table-cell-class.demo.html',
})
export class DataTableCellClassDemo {
  protected readonly equipment: EquipmentItem[] = [
    { id: 1, name: 'Oscilloscope', category: 'Test equipment', quantity: 4, status: 'In stock' },
    { id: 2, name: 'Soldering station', category: 'Workbench tools', quantity: 12, status: 'In stock' },
    { id: 3, name: 'Multimeter', category: 'Test equipment', quantity: 0, status: 'Out of stock' },
    { id: 4, name: '3D printer', category: 'Fabrication', quantity: 2, status: 'Low stock' },
    { id: 5, name: 'Reflow oven', category: 'Fabrication', quantity: 0, status: 'Out of stock' },
  ];

  protected readonly cellClass = (row: EquipmentItem, field: string): string => {
    if (field === 'status' && row.status === 'Out of stock') {
      return 'bg-red-50 text-red-700 font-medium dark:bg-red-950/40 dark:text-red-300';
    }
    if (field === 'status' && row.status === 'Low stock') {
      return 'bg-amber-50 text-amber-700 font-medium dark:bg-amber-950/40 dark:text-amber-300';
    }
    return '';
  };
}
