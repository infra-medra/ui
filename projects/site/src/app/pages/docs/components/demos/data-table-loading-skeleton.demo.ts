import { Component, signal } from '@angular/core';
import { ButtonDirective, DataTableComponent, TableColumnComponent } from '@medra.dev/ui';

interface EquipmentItem {
  readonly id: number;
  readonly name: string;
  readonly category: string;
  readonly quantity: number;
}

@Component({
  selector: 'app-data-table-loading-skeleton-demo',
  imports: [ButtonDirective, DataTableComponent, TableColumnComponent],
  templateUrl: './data-table-loading-skeleton.demo.html',
})
export class DataTableLoadingSkeletonDemo {
  protected readonly equipment: EquipmentItem[] = [
    { id: 1, name: 'Oscilloscope', category: 'Test equipment', quantity: 4 },
    { id: 2, name: 'Soldering station', category: 'Workbench tools', quantity: 12 },
    { id: 3, name: 'Multimeter', category: 'Test equipment', quantity: 0 },
    { id: 4, name: '3D printer', category: 'Fabrication', quantity: 2 },
    { id: 5, name: 'Logic analyzer', category: 'Test equipment', quantity: 3 },
  ];

  protected readonly loading = signal(true);
}
