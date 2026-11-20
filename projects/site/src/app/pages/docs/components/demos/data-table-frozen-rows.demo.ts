import { Component } from '@angular/core';
import { DataTableComponent, TableColumnComponent } from '@medra.dev/ui';

interface EquipmentItem {
  readonly id: number;
  readonly name: string;
  readonly category: string;
  readonly quantity: number;
  readonly status: string;
}

@Component({
  selector: 'app-data-table-frozen-rows-demo',
  imports: [DataTableComponent, TableColumnComponent],
  templateUrl: './data-table-frozen-rows.demo.html',
})
export class DataTableFrozenRowsDemo {
  protected readonly equipment: EquipmentItem[] = [
    { id: 1, name: 'Oscilloscope', category: 'Test equipment', quantity: 4, status: 'In stock' },
    { id: 2, name: 'Soldering station', category: 'Workbench tools', quantity: 12, status: 'In stock' },
    { id: 3, name: 'Multimeter', category: 'Test equipment', quantity: 0, status: 'Out of stock' },
    { id: 4, name: '3D printer', category: 'Fabrication', quantity: 2, status: 'Low stock' },
    { id: 5, name: 'Logic analyzer', category: 'Test equipment', quantity: 3, status: 'In stock' },
    { id: 6, name: 'Bench power supply', category: 'Workbench tools', quantity: 6, status: 'In stock' },
  ];

  protected readonly rows: EquipmentItem[] = Array.from({ length: 5 }, (_, round) =>
    this.equipment.map((item) => ({ ...item, id: round * 6 + item.id, name: `${item.name} #${round + 1}` })),
  ).flat();

  protected readonly pinned: EquipmentItem[] = [{ id: 100, name: 'Pinned: calibration kit', category: 'Test equipment', quantity: 1, status: 'In stock' }];
}
