import { Component, signal } from '@angular/core';
import { DataTableComponent, InputTextDirective, TableColumnComponent, type TableRowEditEvent } from '@medra.dev/ui';

interface PersonItem {
  readonly id: number;
  readonly name: string;
  readonly role: string;
  readonly team: string;
  readonly location: string;
}

interface RoomItem {
  readonly id: number;
  readonly room: string;
  readonly supervisor: string;
  readonly capacity: number;
}

interface ShiftItem {
  readonly id: number;
  readonly name: string;
  readonly team: string;
  readonly shift: string;
  readonly room: string;
  readonly badge: string;
}

@Component({
  selector: 'app-data-table-responsive-stack-demo',
  imports: [DataTableComponent, TableColumnComponent, InputTextDirective],
  templateUrl: './data-table-responsive-stack.demo.html',
})
export class DataTableResponsiveStackDemo {
  protected readonly people: PersonItem[] = [
    { id: 1, name: 'Ana Souza', role: 'Technician', team: 'Lab A', location: 'Building 1' },
    { id: 2, name: 'Bruno Lima', role: 'Engineer', team: 'Lab B', location: 'Building 2' },
    { id: 3, name: 'Carla Mendes', role: 'Manager', team: 'Operations', location: 'Building 1' },
    { id: 4, name: 'Diego Ramos', role: 'Technician', team: 'Lab A', location: 'Workshop' },
    { id: 5, name: 'Elisa Costa', role: 'Analyst', team: 'Quality', location: 'Building 2' },
    { id: 6, name: 'Felipe Nunes', role: 'Engineer', team: 'Lab B', location: 'Workshop' },
  ];

  /** Pinned above the body as a frozen row. */
  protected readonly onCall: ShiftItem[] = [{ id: 100, name: 'Gabriela Rocha', team: 'On call', shift: 'Night', room: 'Control room', badge: 'B-100' }];

  /** Sorted by team, so each team renders under one subheader row. */
  protected readonly shifts: ShiftItem[] = [
    { id: 11, name: 'Ana Souza', team: 'Lab A', shift: 'Morning', room: 'Room 101', badge: 'B-011' },
    { id: 12, name: 'Diego Ramos', team: 'Lab A', shift: 'Evening', room: 'Room 102', badge: 'B-012' },
    { id: 13, name: 'Bruno Lima', team: 'Lab B', shift: 'Morning', room: 'Room 201', badge: 'B-013' },
    { id: 14, name: 'Felipe Nunes', team: 'Lab B', shift: 'Evening', room: 'Room 202', badge: 'B-014' },
  ];

  /** The first shift starts expanded, so its detail row shows. */
  protected readonly expandedShifts = signal<Record<string, boolean>>({ 11: true });

  /** Edited a row at a time; while stacked the editor sits on its own line under the cell's label. */
  protected readonly rooms = signal<RoomItem[]>([
    { id: 21, room: 'Room 101', supervisor: 'Ana Souza', capacity: 8 },
    { id: 22, room: 'Room 201', supervisor: 'Bruno Lima', capacity: 12 },
  ]);

  protected onRoomEditComplete(event: TableRowEditEvent<RoomItem>): void {
    const next = { ...event.row, ...event.values } as RoomItem;
    this.rooms.update((rows) => rows.map((row) => (row.id === event.row.id ? next : row)));
  }
}
