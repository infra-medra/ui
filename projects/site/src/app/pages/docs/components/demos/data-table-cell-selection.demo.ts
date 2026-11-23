import { Component, computed, signal } from '@angular/core';
import { DataTableComponent, TableColumnComponent, type TableCellSelection } from '@medra.dev/ui';

interface EquipmentItem {
  readonly id: number;
  readonly name: string;
  readonly category: string;
  readonly quantity: number;
  readonly status: 'In stock' | 'Low stock' | 'Out of stock';
}

@Component({
  selector: 'app-data-table-cell-selection-demo',
  imports: [DataTableComponent, TableColumnComponent],
  templateUrl: './data-table-cell-selection.demo.html',
})
export class DataTableCellSelectionDemo {
  protected readonly equipment: EquipmentItem[] = [
    { id: 1, name: 'Oscilloscope', category: 'Test equipment', quantity: 4, status: 'In stock' },
    { id: 2, name: 'Soldering station', category: 'Workbench tools', quantity: 12, status: 'In stock' },
    { id: 3, name: 'Multimeter', category: 'Test equipment', quantity: 0, status: 'Out of stock' },
    { id: 4, name: '3D printer', category: 'Fabrication', quantity: 2, status: 'Low stock' },
  ];

  protected readonly selected = signal<
    EquipmentItem | readonly EquipmentItem[] | TableCellSelection<EquipmentItem> | readonly TableCellSelection<EquipmentItem>[] | null
  >(null);

  protected readonly selectedLabel = computed(() => {
    const val = this.selected();
    if (val && !Array.isArray(val) && typeof val === 'object' && 'row' in val && 'field' in val) {
      return `${val.row.name} (${val.field})`;
    }
    return 'none';
  });
}
