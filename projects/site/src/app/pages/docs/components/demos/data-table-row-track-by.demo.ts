import { Component } from '@angular/core';
import { DataTableComponent, TableColumnComponent } from '@medra.dev/ui';

interface EquipmentItem {
  readonly id: number;
  readonly name: string;
  readonly category: string;
  readonly quantity: number;
}

@Component({
  selector: 'app-data-table-row-track-by-demo',
  imports: [DataTableComponent, TableColumnComponent],
  templateUrl: './data-table-row-track-by.demo.html',
})
export class DataTableRowTrackByDemo {
  protected equipment: EquipmentItem[] = [
    { id: 1, name: 'Oscilloscope', category: 'Test equipment', quantity: 4 },
    { id: 2, name: 'Soldering station', category: 'Workbench tools', quantity: 12 },
    { id: 3, name: 'Multimeter', category: 'Test equipment', quantity: 9 },
    { id: 4, name: '3D printer', category: 'Fabrication', quantity: 2 },
  ];

  /** Identifies a row by its record, so a refresh keeps each row's element and its expansion. */
  protected readonly byId = (row: EquipmentItem): number => row.id;

  /** Replaces the data with new objects in the opposite order, as a reload from a server would. */
  protected refresh(): void {
    this.equipment = this.equipment.map((item) => ({ ...item })).reverse();
  }
}
