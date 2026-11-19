import { Component, signal } from '@angular/core';
import { PickListComponent } from '@medra.dev/ui';

interface Reviewer {
  readonly name: string;
  readonly expertise: string;
}

@Component({
  selector: 'app-pick-list-basic-demo',
  imports: [PickListComponent],
  templateUrl: './pick-list-basic.demo.html',
})
export class PickListBasicDemo {
  protected readonly available = signal<Reviewer[]>([
    { name: 'Lena Ortiz', expertise: 'Distributed systems' },
    { name: 'Hassan Ibrahim', expertise: 'Accessibility' },
    { name: 'Chidi Okafor', expertise: 'Security' },
    { name: 'Yuki Tanaka', expertise: 'Frontend performance' },
  ]);

  protected readonly assigned = signal<Reviewer[]>([{ name: 'Marta Kowalski', expertise: 'Developer tooling' }]);
}
