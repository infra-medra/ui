export type DatePickerSelectionMode = 'single' | 'multiple' | 'range';

export type DatePickerView = 'date' | 'month' | 'year';

export interface DateRange {
  readonly start: Date | null;
  readonly end: Date | null;
}

export interface DatePickerDateTemplateContext {
  readonly $implicit: Date;
  readonly date: number;
  readonly month: number;
  readonly year: number;
  readonly today: boolean;
  readonly selected: boolean;
  readonly disabled: boolean;
  readonly selectable: boolean;
  readonly outsideMonth: boolean;
}

/**
 * Shape picked by `selectionMode`, not a generic type parameter: `'single'`
 * carries `Date | null`, `'multiple'` carries `readonly Date[]`, `'range'`
 * carries `DateRange`. `DatePickerComponent` branches on its own
 * `selectionMode()` input at runtime to interpret this — consumers get
 * compile-time safety naturally because *they* declare a concretely-typed
 * local field (`Date | null` vs `readonly Date[]` vs `DateRange`) bound via
 * `[(ngModel)]`/`formControl`, not because this type itself narrows.
 */
export type DatePickerValue = Date | DateRange | readonly Date[] | null;
