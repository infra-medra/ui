import { Component } from '@angular/core';
import { DataTableComponent, TableColumnComponent } from '@medra.dev/ui';

interface EquipmentItem {
  readonly name: string;
  readonly category: string;
  readonly quantity: number;
}

@Component({
  selector: 'app-data-table-row-group-subheader-demo',
  imports: [DataTableComponent, TableColumnComponent],
  templateUrl: './data-table-row-group-subheader.demo.html',
})
export class DataTableRowGroupSubheaderDemo {
  protected readonly equipment: EquipmentItem[] = [
    { name: 'Oscilloscope', category: 'Test equipment', quantity: 4 },
    { name: 'Multimeter', category: 'Test equipment', quantity: 0 },
    { name: 'Logic analyzer', category: 'Test equipment', quantity: 3 },
    { name: 'Soldering station', category: 'Workbench tools', quantity: 12 },
    { name: 'Bench power supply', category: 'Workbench tools', quantity: 6 },
    { name: '3D printer', category: 'Fabrication', quantity: 2 },
    { name: 'Laser cutter', category: 'Fabrication', quantity: 1 },
  ];
}
