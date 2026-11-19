import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectComponent } from '@medra.dev/ui';

/** A city in the consumer's own data: its own field names, not the `label`/`value` defaults. */
interface City {
  name: string;
  code: string;
  closed?: boolean;
}

/** A group of cities, with its own field names for the header and the child list. */
interface Country {
  country: string;
  cities: City[];
}

@Component({
  selector: 'app-select-data-model-demo',
  imports: [FormsModule, SelectComponent],
  templateUrl: './select-data-model.demo.html',
})
export class SelectDataModelDemo {
  // Data format:
  // - By default every option is `{ label, value, disabled? }`.
  // - A flat list is grouped by setting `group` on consecutive options.
  // - Nested groups use `optionGroupLabel` (the header field) and `optionGroupChildren` (the field
  //   that holds the child options).
  // - `optionLabel`, `optionValue` and `optionDisabled` read other fields of your own objects, so
  //   the data does not need to be reshaped.
  protected readonly countries: Country[] = [
    {
      country: 'Brazil',
      cities: [
        { name: 'São Paulo', code: 'br-sp' },
        { name: 'Rio de Janeiro', code: 'br-rj', closed: true },
      ],
    },
    {
      country: 'Portugal',
      cities: [
        { name: 'Lisbon', code: 'pt-lis' },
        { name: 'Porto', code: 'pt-opo' },
      ],
    },
  ];

  protected city: string | null = null;
}
