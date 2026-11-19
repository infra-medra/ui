import { Component, signal } from '@angular/core';
import { PaginatorComponent } from '@medra/ui';

@Component({
  selector: 'app-paginator-rows-per-page-demo',
  imports: [PaginatorComponent],
  templateUrl: './paginator-rows-per-page.demo.html',
})
export class PaginatorRowsPerPageDemo {
  protected readonly first = signal(0);
  protected readonly rows = signal(10);
}
