import { Component, signal } from '@angular/core';
import { DataTableComponent, InputTextDirective, TableColumnComponent, type TableRowEditEvent } from '@medra.dev/ui';

interface EquipmentItem {
  readonly name: string;
  readonly category: string;
  readonly quantity: number;
}

@Component({
  selector: 'app-data-table-edit-row-demo',
  imports: [DataTableComponent, TableColumnComponent, InputTextDirective],
  templateUrl: './data-table-edit-row.demo.html',
})
export class DataTableEditRowDemo {
  protected readonly equipment = signal<EquipmentItem[]>([
    { name: 'Oscilloscope', category: 'Test equipment', quantity: 4 },
    { name: 'Soldering station', category: 'Workbench tools', quantity: 12 },
    { name: 'Multimeter', category: 'Test equipment', quantity: 0 },
    { name: '3D printer', category: 'Fabrication', quantity: 2 },
    { name: 'Laser cutter', category: 'Fabrication', quantity: 1 },
  ]);
  protected readonly savedRow = signal<string>('');

  protected onRowEditComplete(event: TableRowEditEvent<EquipmentItem>): void {
    const next = { ...event.row, ...event.values } as EquipmentItem;
    this.equipment.update((rows) => rows.map((row) => (row === event.row ? next : row)));
    this.savedRow.set(`${next.name} (${next.quantity})`);
  }
}
