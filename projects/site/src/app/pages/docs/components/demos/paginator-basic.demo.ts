import { Component, signal } from '@angular/core';
import { PaginatorComponent } from '@medra/ui';

@Component({
  selector: 'app-paginator-basic-demo',
  imports: [PaginatorComponent],
  templateUrl: './paginator-basic.demo.html',
})
export class PaginatorBasicDemo {
  protected readonly first = signal(0);
}
