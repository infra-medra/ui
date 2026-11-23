import { Component } from '@angular/core';
import { DataTableComponent, TableColumnComponent } from '@medra.dev/ui';

interface EquipmentItem {
  readonly id: number;
  readonly name: string;
  readonly category: string;
  readonly quantity: number;
}

@Component({
  selector: 'app-data-table-caption-summary-demo',
  imports: [DataTableComponent, TableColumnComponent],
  templateUrl: './data-table-caption-summary.demo.html',
})
export class DataTableCaptionSummaryDemo {
  protected readonly equipment: EquipmentItem[] = [
    { id: 1, name: 'Oscilloscope', category: 'Test equipment', quantity: 4 },
    { id: 2, name: 'Soldering station', category: 'Workbench tools', quantity: 12 },
    { id: 3, name: 'Multimeter', category: 'Test equipment', quantity: 0 },
    { id: 4, name: '3D printer', category: 'Fabrication', quantity: 2 },
    { id: 5, name: 'Logic analyzer', category: 'Test equipment', quantity: 3 },
    { id: 6, name: 'Bench power supply', category: 'Workbench tools', quantity: 6 },
  ];

  protected readonly totalQuantity = this.equipment.reduce((sum, item) => sum + item.quantity, 0);
}
