import { Component, signal } from '@angular/core';
import { DataTableComponent, TableColumnComponent, type TableRowReorderEvent } from '@medra/ui';

interface Playlist {
  readonly id: string;
  readonly title: string;
  readonly artist: string;
}

@Component({
  selector: 'app-data-table-reorder-events-demo',
  imports: [DataTableComponent, TableColumnComponent],
  templateUrl: './data-table-reorder-events.demo.html',
})
export class DataTableReorderEventsDemo {
  protected readonly tracks = signal<Playlist[]>([
    { id: 't1', title: 'Morning Glow', artist: 'Nadia Reyes' },
    { id: 't2', title: 'Concrete Skyline', artist: 'The Overpass' },
    { id: 't3', title: 'Slow Tide', artist: 'Mira Fenn' },
    { id: 't4', title: 'Paper Lanterns', artist: 'Kojo & the Static' },
  ]);

  protected readonly selection = signal<Playlist[]>([]);
  protected readonly lastEvent = signal('No event yet.');

  protected onReorder(event: TableRowReorderEvent): void {
    this.tracks.update((current) => {
      const next = [...current];
      const [moved] = next.splice(event.dragIndex, 1);
      next.splice(event.dropIndex, 0, moved);
      return next;
    });
    this.lastEvent.set(`Reordered: index ${event.dragIndex} → ${event.dropIndex}`);
  }

  protected onRowSelect(track: Playlist): void {
    this.lastEvent.set(`Selected: ${track.title}`);
  }

  protected onRowUnselect(track: Playlist): void {
    this.lastEvent.set(`Unselected: ${track.title}`);
  }
}
