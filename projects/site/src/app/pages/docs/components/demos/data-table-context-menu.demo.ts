import { Component, signal } from '@angular/core';
import { ContextMenuDirective, DataTableComponent, TableColumnComponent, type MenuItem } from '@medra.dev/ui';

interface EquipmentItem {
  readonly id: number;
  readonly name: string;
  readonly category: string;
  readonly quantity: number;
}

@Component({
  selector: 'app-data-table-context-menu-demo',
  imports: [ContextMenuDirective, DataTableComponent, TableColumnComponent],
  templateUrl: './data-table-context-menu.demo.html',
})
export class DataTableContextMenuDemo {
  protected readonly equipment: EquipmentItem[] = [
    { id: 1, name: 'Oscilloscope', category: 'Test equipment', quantity: 4 },
    { id: 2, name: 'Soldering station', category: 'Workbench tools', quantity: 12 },
    { id: 3, name: 'Multimeter', category: 'Test equipment', quantity: 0 },
    { id: 4, name: '3D printer', category: 'Fabrication', quantity: 2 },
  ];

  protected readonly selectedRow = signal<EquipmentItem | null>(null);
  protected readonly lastAction = signal('Right-click a row or press Shift+F10 on a focused row.');

  protected readonly menuItems: MenuItem[] = [
    { label: 'Inspect' },
    { label: 'Duplicate' },
    { label: 'Archive' },
  ];

  protected onMenuItemSelect(item: MenuItem): void {
    const row = this.selectedRow();
    this.lastAction.set(`${item.label}: ${row ? row.name : 'none'}`);
  }
}
