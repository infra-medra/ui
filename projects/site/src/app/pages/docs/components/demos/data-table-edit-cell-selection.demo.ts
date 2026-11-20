import { Component, signal } from '@angular/core';
import { DataTableComponent, InputTextDirective, TableColumnComponent } from '@medra.dev/ui';

interface EquipmentItem {
  readonly name: string;
  readonly category: string;
  readonly quantity: number;
}

@Component({
  selector: 'app-data-table-edit-cell-selection-demo',
  imports: [DataTableComponent, TableColumnComponent, InputTextDirective],
  templateUrl: './data-table-edit-cell-selection.demo.html',
})
export class DataTableEditCellSelectionDemo {
  protected readonly equipment = signal<EquipmentItem[]>([
    { name: 'Oscilloscope', category: 'Test equipment', quantity: 4 },
    { name: 'Soldering station', category: 'Workbench tools', quantity: 12 },
    { name: 'Multimeter', category: 'Test equipment', quantity: 0 },
    { name: '3D printer', category: 'Fabrication', quantity: 2 },
  ]);
  protected readonly selected = signal<EquipmentItem | null>(null);

  protected onEditComplete(event: { row: EquipmentItem; field: string; value: unknown }): void {
    this.equipment.update((rows) => rows.map((row) => (row === event.row ? { ...row, quantity: Number(event.value) } : row)));
  }
}
