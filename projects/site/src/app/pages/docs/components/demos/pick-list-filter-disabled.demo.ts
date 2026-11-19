import { Component, signal } from '@angular/core';
import { PickListComponent } from '@medra/ui';

interface Reviewer {
  readonly name: string;
  readonly expertise: string;
  readonly onLeave?: boolean;
}

@Component({
  selector: 'app-pick-list-filter-disabled-demo',
  imports: [PickListComponent],
  templateUrl: './pick-list-filter-disabled.demo.html',
})
export class PickListFilterDisabledDemo {
  protected readonly available = signal<Reviewer[]>([
    { name: 'Lena Ortiz', expertise: 'Distributed systems' },
    { name: 'Hassan Ibrahim', expertise: 'Accessibility', onLeave: true },
    { name: 'Chidi Okafor', expertise: 'Security' },
    { name: 'Yuki Tanaka', expertise: 'Frontend performance' },
  ]);

  protected readonly assigned = signal<Reviewer[]>([{ name: 'Marta Kowalski', expertise: 'Developer tooling' }]);
  protected readonly lastTransfer = signal('No transfer yet.');

  protected readonly filterPredicate = (item: Reviewer, query: string): boolean =>
    item.name.toLowerCase().includes(query.toLowerCase()) || item.expertise.toLowerCase().includes(query.toLowerCase());

  protected readonly itemDisabled = (item: Reviewer): boolean => !!item.onLeave;

  protected onMoveToTarget(items: readonly Reviewer[]): void {
    this.lastTransfer.set(`Assigned: ${items.map((i) => i.name).join(', ')}`);
  }

  protected onMoveToSource(items: readonly Reviewer[]): void {
    this.lastTransfer.set(`Unassigned: ${items.map((i) => i.name).join(', ')}`);
  }
}
