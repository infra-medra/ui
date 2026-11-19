/** Same runtime-branching value shape already used by DatePicker's `selectionMode` — `range` decides which shape `writeValue`/`onChange` deal in. */
export interface SliderRange {
  readonly start: number;
  readonly end: number;
}

export type SliderValue = number | SliderRange;
