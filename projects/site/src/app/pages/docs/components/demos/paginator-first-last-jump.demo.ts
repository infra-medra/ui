import { Component, signal } from '@angular/core';
import { PaginatorComponent } from '@medra/ui';

@Component({
  selector: 'app-paginator-first-last-jump-demo',
  imports: [PaginatorComponent],
  templateUrl: './paginator-first-last-jump.demo.html',
})
export class PaginatorFirstLastJumpDemo {
  protected readonly first = signal(0);
}
