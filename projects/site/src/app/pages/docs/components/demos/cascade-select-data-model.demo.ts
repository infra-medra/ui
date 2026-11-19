import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CascadeSelectComponent } from '@medra.dev/ui';

/** A node of the consumer's own data: its own field names, not the `label`/`value`/`children` defaults. */
interface Place {
  name: string;
  code?: string;
  items?: Place[];
}

@Component({
  selector: 'app-cascade-select-data-model-demo',
  imports: [FormsModule, CascadeSelectComponent],
  templateUrl: './cascade-select-data-model.demo.html',
})
export class CascadeSelectDataModelDemo {
  // Each node that has a sub-list carries it in `items` (read through `optionGroupChildren`).
  // Only the leaves carry a value, here in `code` (read through `optionValue`).
  protected readonly places: Place[] = [
    {
      name: 'Brazil',
      items: [
        { name: 'São Paulo', items: [{ name: 'São Paulo', code: 'br-sp-sp' }, { name: 'Campinas', code: 'br-sp-cp' }] },
        { name: 'Minas Gerais', items: [{ name: 'Belo Horizonte', code: 'br-mg-bh' }] },
      ],
    },
    {
      name: 'Portugal',
      items: [{ name: 'Lisbon', items: [{ name: 'Lisbon', code: 'pt-li-li' }, { name: 'Sintra', code: 'pt-li-si' }] }],
    },
  ];

  protected place: string | null = null;
}
