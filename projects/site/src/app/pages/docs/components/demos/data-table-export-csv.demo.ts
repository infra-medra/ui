import { Component } from '@angular/core';
import { ButtonDirective, DataTableComponent, TableColumnComponent } from '@medra.dev/ui';

interface EquipmentItem {
  readonly name: string;
  readonly category: string;
  readonly quantity: number;
}

@Component({
  selector: 'app-data-table-export-csv-demo',
  imports: [DataTableComponent, TableColumnComponent, ButtonDirective],
  templateUrl: './data-table-export-csv.demo.html',
})
export class DataTableExportCsvDemo {
  protected readonly equipment: EquipmentItem[] = [
    { name: 'Oscilloscope', category: 'Test equipment', quantity: 4 },
    { name: 'Soldering station', category: 'Workbench tools', quantity: 12 },
    { name: 'Multimeter', category: 'Test equipment', quantity: 0 },
    { name: '3D printer', category: 'Fabrication', quantity: 2 },
  ];
}
