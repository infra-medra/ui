import { Component, TemplateRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatePickerPanelComponent } from './date-picker-panel.component';
import { DatePickerSelectionMode, DateRange } from './date-picker.types';

interface PanelInputs {
  selectionMode?: DatePickerSelectionMode;
  pickerView?: 'date' | 'month' | 'year';
  navigation?: 'calendar' | 'drilldown';
  initialViewDate?: Date;
  todayDate?: Date;
  selectedValue?: Date | null;
  selectedRange?: DateRange;
  selectedDates?: readonly Date[];
  minDate?: Date | null;
  maxDate?: Date | null;
  disabledDates?: readonly Date[];
  disabledDays?: readonly number[];
  firstDayOfWeek?: number;
  numberOfMonths?: number;
  showButtonBar?: boolean;
  todayLabel?: string;
  clearLabel?: string;
  previousDecadeLabel?: string;
  nextDecadeLabel?: string;
  timeOnly?: boolean;
  showTime?: boolean;
  hourFormat?: '12' | '24';
  autoFocus?: boolean;
  inline?: boolean;
  disabled?: boolean;
  dateTemplate?: TemplateRef<unknown> | null;
}

function createPanel(inputs: PanelInputs = {}): ComponentFixture<DatePickerPanelComponent> {
  const fixture = TestBed.createComponent(DatePickerPanelComponent);
  fixture.componentRef.setInput('panelId', 'test-panel');
  fixture.componentRef.setInput('initialViewDate', inputs.initialViewDate ?? new Date(2026, 6, 15));
  fixture.componentRef.setInput('todayDate', inputs.todayDate ?? new Date(2026, 6, 15));
  if (inputs.selectionMode) fixture.componentRef.setInput('selectionMode', inputs.selectionMode);
  if (inputs.pickerView) fixture.componentRef.setInput('pickerView', inputs.pickerView);
  if (inputs.navigation) fixture.componentRef.setInput('navigation', inputs.navigation);
  if (inputs.selectedValue !== undefined) fixture.componentRef.setInput('selectedValue', inputs.selectedValue);
  if (inputs.selectedRange) fixture.componentRef.setInput('selectedRange', inputs.selectedRange);
  if (inputs.selectedDates) fixture.componentRef.setInput('selectedDates', inputs.selectedDates);
  if (inputs.minDate !== undefined) fixture.componentRef.setInput('minDate', inputs.minDate);
  if (inputs.maxDate !== undefined) fixture.componentRef.setInput('maxDate', inputs.maxDate);
  if (inputs.disabledDates) fixture.componentRef.setInput('disabledDates', inputs.disabledDates);
  if (inputs.disabledDays) fixture.componentRef.setInput('disabledDays', inputs.disabledDays);
  if (inputs.firstDayOfWeek !== undefined) fixture.componentRef.setInput('firstDayOfWeek', inputs.firstDayOfWeek);
  if (inputs.numberOfMonths !== undefined) fixture.componentRef.setInput('numberOfMonths', inputs.numberOfMonths);
  if (inputs.showButtonBar !== undefined) fixture.componentRef.setInput('showButtonBar', inputs.showButtonBar);
  if (inputs.todayLabel !== undefined) fixture.componentRef.setInput('todayLabel', inputs.todayLabel);
  if (inputs.clearLabel !== undefined) fixture.componentRef.setInput('clearLabel', inputs.clearLabel);
  if (inputs.previousDecadeLabel !== undefined) fixture.componentRef.setInput('previousDecadeLabel', inputs.previousDecadeLabel);
  if (inputs.nextDecadeLabel !== undefined) fixture.componentRef.setInput('nextDecadeLabel', inputs.nextDecadeLabel);
  if (inputs.timeOnly !== undefined) fixture.componentRef.setInput('timeOnly', inputs.timeOnly);
  if (inputs.showTime !== undefined) fixture.componentRef.setInput('showTime', inputs.showTime);
  if (inputs.hourFormat !== undefined) fixture.componentRef.setInput('hourFormat', inputs.hourFormat);
  if (inputs.autoFocus !== undefined) fixture.componentRef.setInput('autoFocus', inputs.autoFocus);
  if (inputs.inline !== undefined) fixture.componentRef.setInput('inline', inputs.inline);
  if (inputs.disabled !== undefined) fixture.componentRef.setInput('disabled', inputs.disabled);
  if (inputs.dateTemplate !== undefined) fixture.componentRef.setInput('dateTemplate', inputs.dateTemplate);
  fixture.detectChanges();
  return fixture;
}

function activeContainer(fixture: ComponentFixture<DatePickerPanelComponent>): HTMLElement {
  return fixture.nativeElement.querySelector('[role="grid"], [role="listbox"]') as HTMLElement;
}

function gridCells(fixture: ComponentFixture<DatePickerPanelComponent>): NodeListOf<HTMLElement> {
  return fixture.nativeElement.querySelectorAll('[role="gridcell"]');
}

function keydown(fixture: ComponentFixture<DatePickerPanelComponent>, key: string, opts: Partial<KeyboardEventInit> = {}): void {
  activeContainer(fixture).dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...opts }));
  fixture.detectChanges();
}

function pointerdownOn(fixture: ComponentFixture<DatePickerPanelComponent>, selector: string): void {
  const el = fixture.nativeElement.querySelector(selector) as HTMLElement;
  el.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));
  fixture.detectChanges();
}

function clickOn(fixture: ComponentFixture<DatePickerPanelComponent>, selector: string): void {
  const el = fixture.nativeElement.querySelector(selector) as HTMLElement;
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  fixture.detectChanges();
}

function pointerEnterOn(fixture: ComponentFixture<DatePickerPanelComponent>, selector: string): void {
  const el = fixture.nativeElement.querySelector(selector) as HTMLElement;
  el.dispatchEvent(new MouseEvent('pointerenter', { bubbles: true, cancelable: true }));
  fixture.detectChanges();
}

describe('DatePickerPanelComponent - calendar mode (day grid)', () => {
  it('renders a fixed 6x7 day grid', () => {
    const fixture = createPanel();
    expect(gridCells(fixture).length).toBe(42);
  });

  it('reorders the weekday header when firstDayOfWeek changes', () => {
    const sunday = createPanel({ firstDayOfWeek: 0 });
    const monday = createPanel({ firstDayOfWeek: 1 });
    const sundayFirstHeader = sunday.nativeElement.querySelector('[role="columnheader"]')!.textContent!.trim();
    const mondayFirstHeader = monday.nativeElement.querySelector('[role="columnheader"]')!.textContent!.trim();
    expect(sundayFirstHeader).not.toBe(mondayFirstHeader);
  });

  it('ArrowRight moves the focused day by one day', () => {
    const fixture = createPanel({ initialViewDate: new Date(2026, 6, 15) });
    keydown(fixture, 'ArrowRight');
    expect(activeContainer(fixture).getAttribute('aria-activedescendant')).toBe('test-panel-day-2026-6-16');
  });

  it('Home/End move to the start/end of the focused week', () => {
    const fixture = createPanel({ initialViewDate: new Date(2026, 6, 15) }); // Wednesday
    keydown(fixture, 'Home');
    expect(activeContainer(fixture).getAttribute('aria-activedescendant')).toBe('test-panel-day-2026-6-12'); // Sunday
    keydown(fixture, 'End');
    expect(activeContainer(fixture).getAttribute('aria-activedescendant')).toBe('test-panel-day-2026-6-18'); // Saturday
  });

  it('PageDown steps one month, clamping the day-of-month (Jan 31 -> Feb 28 in a non-leap year)', () => {
    const fixture = createPanel({ initialViewDate: new Date(2026, 0, 31) });
    keydown(fixture, 'PageDown');
    expect(activeContainer(fixture).getAttribute('aria-activedescendant')).toBe('test-panel-day-2026-1-28');
  });

  it('Shift+PageDown steps one year', () => {
    const fixture = createPanel({ initialViewDate: new Date(2026, 6, 15) });
    keydown(fixture, 'PageDown', { shiftKey: true });
    expect(activeContainer(fixture).getAttribute('aria-activedescendant')).toBe('test-panel-day-2027-6-15');
  });

  it('PageUp/PageDown/Shift+Page{Up,Down} are no-ops in drilldown mode (no chevron-equivalent nav in the day view)', () => {
    const fixture = createPanel({ navigation: 'drilldown', initialViewDate: new Date(2026, 6, 15) });
    pointerdownOn(fixture, '#test-panel-year-2026');
    pointerdownOn(fixture, '#test-panel-month-2026-6');
    const before = activeContainer(fixture).getAttribute('aria-activedescendant');
    keydown(fixture, 'PageDown');
    keydown(fixture, 'PageDown', { shiftKey: true });
    expect(activeContainer(fixture).getAttribute('aria-activedescendant')).toBe(before);
  });

  it('Enter selects the focused day in single mode', () => {
    const fixture = createPanel({ selectionMode: 'single', initialViewDate: new Date(2026, 6, 15) });
    const selected = jest.fn();
    fixture.componentInstance.dateSelect.subscribe(selected);
    keydown(fixture, 'Enter');
    expect(selected).toHaveBeenCalledWith(new Date(2026, 6, 15));
  });

  it('a day outside [minDate, maxDate] is aria-disabled and ignores clicks', () => {
    const fixture = createPanel({
      initialViewDate: new Date(2026, 6, 15),
      minDate: new Date(2026, 6, 10),
      maxDate: new Date(2026, 6, 20),
    });
    const selected = jest.fn();
    fixture.componentInstance.dateSelect.subscribe(selected);
    const cell = fixture.nativeElement.querySelector('#test-panel-day-2026-6-5') as HTMLElement;
    expect(cell.getAttribute('aria-disabled')).toBe('true');
    pointerdownOn(fixture, '#test-panel-day-2026-6-5');
    expect(selected).not.toHaveBeenCalled();
  });

  it('previous/next month chevrons disable once the adjacent month is wholly out of bounds', () => {
    const fixture = createPanel({
      initialViewDate: new Date(2026, 6, 15),
      minDate: new Date(2026, 6, 1),
      maxDate: new Date(2026, 6, 31),
    });
    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect((buttons[0] as HTMLButtonElement).disabled).toBe(true); // previous month
    expect((buttons[1] as HTMLButtonElement).disabled).toBe(true); // next month
  });

  describe('disabledDates / disabledDays', () => {
    it('marks a specific disabledDates entry as aria-disabled and ignores clicks on it', () => {
      const fixture = createPanel({ initialViewDate: new Date(2026, 6, 15), disabledDates: [new Date(2026, 6, 16)] });
      const selected = jest.fn();
      fixture.componentInstance.dateSelect.subscribe(selected);
      const cell = fixture.nativeElement.querySelector('#test-panel-day-2026-6-16') as HTMLElement;
      expect(cell.getAttribute('aria-disabled')).toBe('true');
      pointerdownOn(fixture, '#test-panel-day-2026-6-16');
      expect(selected).not.toHaveBeenCalled();
    });

    it('marks every occurrence of a disabledDays weekday as aria-disabled (e.g. all Saturdays)', () => {
      const fixture = createPanel({ initialViewDate: new Date(2026, 6, 15), disabledDays: [6] }); // Saturday
      expect(fixture.nativeElement.querySelector('#test-panel-day-2026-6-4')!.getAttribute('aria-disabled')).toBe('true');
      expect(fixture.nativeElement.querySelector('#test-panel-day-2026-6-11')!.getAttribute('aria-disabled')).toBe('true');
      expect(fixture.nativeElement.querySelector('#test-panel-day-2026-6-18')!.getAttribute('aria-disabled')).toBe('true');
      expect(fixture.nativeElement.querySelector('#test-panel-day-2026-6-15')!.getAttribute('aria-disabled')).toBeNull();
    });

    it('ArrowRight skips over a day disabled via disabledDates', () => {
      const fixture = createPanel({ initialViewDate: new Date(2026, 6, 15), disabledDates: [new Date(2026, 6, 16)] });
      keydown(fixture, 'ArrowRight');
      expect(activeContainer(fixture).getAttribute('aria-activedescendant')).toBe('test-panel-day-2026-6-17');
    });

    it('ArrowRight skips over consecutive days disabled via disabledDays (weekend)', () => {
      const fixture = createPanel({ initialViewDate: new Date(2026, 6, 17), disabledDays: [0, 6] }); // Friday -> Sat/Sun disabled -> Monday
      keydown(fixture, 'ArrowRight');
      expect(activeContainer(fixture).getAttribute('aria-activedescendant')).toBe('test-panel-day-2026-6-20');
    });

    it('Enter does nothing when the focused day is disabled via disabledDays', () => {
      const fixture = createPanel({ initialViewDate: new Date(2026, 6, 18), disabledDays: [6] }); // Saturday, focused directly
      const selected = jest.fn();
      fixture.componentInstance.dateSelect.subscribe(selected);
      keydown(fixture, 'Enter');
      expect(selected).not.toHaveBeenCalled();
    });
  });

  describe('year filter (drilldown)', () => {
    function filterInput(fixture: ComponentFixture<DatePickerPanelComponent>): HTMLInputElement {
      return fixture.nativeElement.querySelector('input[type="text"]') as HTMLInputElement;
    }

    it('typing narrows the year list, and clears when a fresh pick begins', () => {
      const fixture = createPanel({ navigation: 'drilldown', initialViewDate: new Date(2026, 6, 15) });
      const input = filterInput(fixture);
      input.value = '202';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const years = Array.from(fixture.nativeElement.querySelectorAll('[role="option"]')).map((el) => (el as HTMLElement).textContent!.trim());
      expect(years.every((year) => year.includes('202'))).toBe(true);
      expect(years).toContain('2026');
      expect(years).not.toContain('1926');
    });

    it('shows the empty label when nothing matches the filter', () => {
      const fixture = createPanel({ navigation: 'drilldown', initialViewDate: new Date(2026, 6, 15) });
      const input = filterInput(fixture);
      input.value = 'abc-no-match';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('[role="listbox"]')!.textContent).toContain('No matching years');
    });

    it('Enter selects the focused (filtered) year and moves to the month grid', () => {
      const fixture = createPanel({ navigation: 'drilldown', initialViewDate: new Date(2026, 6, 15) });
      const input = filterInput(fixture);
      input.value = '2030';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('[role="gridcell"]')).not.toBeNull(); // month grid rendered
      expect(fixture.nativeElement.textContent).toContain('2030');
    });
  });

  it('Escape emits closeRequested only, never a selection', () => {
    const fixture = createPanel({ selectionMode: 'single', initialViewDate: new Date(2026, 6, 15) });
    const closeRequested = jest.fn();
    const selected = jest.fn();
    fixture.componentInstance.closeRequested.subscribe(closeRequested);
    fixture.componentInstance.dateSelect.subscribe(selected);
    keydown(fixture, 'Escape');
    expect(closeRequested).toHaveBeenCalledTimes(1);
    expect(selected).not.toHaveBeenCalled();
  });

  describe('range mode', () => {
    it('two clicks pick start/end, swapping if the second click lands earlier', () => {
      const fixture = createPanel({ selectionMode: 'range', initialViewDate: new Date(2026, 6, 15) });
      const completed = jest.fn();
      fixture.componentInstance.rangeComplete.subscribe(completed);

      pointerdownOn(fixture, '#test-panel-day-2026-6-20');
      pointerdownOn(fixture, '#test-panel-day-2026-6-10');

      expect(completed).toHaveBeenCalledWith({ start: new Date(2026, 6, 10), end: new Date(2026, 6, 20) });
    });

    it('clicking the same day twice yields a valid one-day range', () => {
      const fixture = createPanel({ selectionMode: 'range', initialViewDate: new Date(2026, 6, 15) });
      const completed = jest.fn();
      fixture.componentInstance.rangeComplete.subscribe(completed);

      pointerdownOn(fixture, '#test-panel-day-2026-6-15');
      pointerdownOn(fixture, '#test-panel-day-2026-6-15');

      expect(completed).toHaveBeenCalledWith({ start: new Date(2026, 6, 15), end: new Date(2026, 6, 15) });
    });
  });

  describe('numberOfMonths', () => {
    it('renders N months side by side, each its own grid, with consecutive month labels', () => {
      const fixture = createPanel({ initialViewDate: new Date(2026, 6, 15), numberOfMonths: 2 });
      const grids = fixture.nativeElement.querySelectorAll('[role="grid"]');
      expect(grids.length).toBe(2);
      // Only real in-month days are `role="gridcell"` — July (31) + August (31) = 62.
      // Leading/trailing days borrowed from adjacent months are blanked (see next test),
      // not just styled differently, so they never count here.
      expect(fixture.nativeElement.querySelectorAll('[role="gridcell"]').length).toBe(62);
      expect(grids[0].getAttribute('aria-label')).toBe('July 2026');
      expect(grids[1].getAttribute('aria-label')).toBe('August 2026');
    });

    it('blanks out leading days borrowed from July inside August\'s own grid, instead of showing them as real, clickable cells', () => {
      const fixture = createPanel({ initialViewDate: new Date(2026, 6, 15), numberOfMonths: 2 });
      const grids = fixture.nativeElement.querySelectorAll('[role="grid"]');
      // August's grid leads with a few trailing July days (outsideMonth) — those
      // must render as blank, non-interactive placeholders, not real gridcells
      // (July 26-31 already render for real inside July's own, already-visible grid).
      const augustBlanks = grids[1].querySelectorAll('[aria-hidden="true"]');
      expect(augustBlanks.length).toBeGreaterThan(0);
      augustBlanks.forEach((el: Element) => expect((el as HTMLElement).textContent!.trim()).toBe(''));
      // August's own days remain real, interactive gridcells — including day 26,
      // which would otherwise be ambiguous with July 26 if blanks showed numbers.
      expect(document.getElementById('test-panel-day-2026-7-26')).not.toBeNull();
    });

    it('the next chevron slides the whole window forward by one month, not by the full span', () => {
      const fixture = createPanel({ initialViewDate: new Date(2026, 6, 15), numberOfMonths: 2 });
      const nextButton = fixture.nativeElement.querySelectorAll('button')[1] as HTMLButtonElement; // only offset 0 renders the previous/next chevrons
      nextButton.click();
      fixture.detectChanges();

      const grids = fixture.nativeElement.querySelectorAll('[role="grid"]');
      expect(grids[0].getAttribute('aria-label')).toBe('August 2026');
      expect(grids[1].getAttribute('aria-label')).toBe('September 2026');
    });

    it('a range spanning both visible months previews and completes across both grids without losing the first month from view', () => {
      const fixture = createPanel({ selectionMode: 'range', initialViewDate: new Date(2026, 6, 15), numberOfMonths: 2 });
      const completed = jest.fn();
      fixture.componentInstance.rangeComplete.subscribe(completed);

      pointerdownOn(fixture, '#test-panel-day-2026-6-25'); // July 25 — anchor
      pointerEnterOn(fixture, '#test-panel-day-2026-7-5'); // August 5 — live preview, spans both grids

      expect(document.getElementById('test-panel-day-2026-6-25')!.getAttribute('aria-selected')).toBe('true');
      expect(document.getElementById('test-panel-day-2026-7-5')!.getAttribute('aria-selected')).toBe('true');

      pointerdownOn(fixture, '#test-panel-day-2026-7-5'); // commit the end date
      expect(completed).toHaveBeenCalledWith({ start: new Date(2026, 6, 25), end: new Date(2026, 7, 5) });

      // Completing the range must not scroll July out of the window just because August was clicked last.
      const grids = fixture.nativeElement.querySelectorAll('[role="grid"]');
      expect(grids[0].getAttribute('aria-label')).toBe('July 2026');
      expect(grids[1].getAttribute('aria-label')).toBe('August 2026');
    });

    it('is ignored in drilldown mode — always exactly one month', () => {
      const fixture = createPanel({ navigation: 'drilldown', initialViewDate: new Date(2026, 6, 15), numberOfMonths: 3 });
      // Drill down to the day view.
      pointerdownOn(fixture, '#test-panel-year-2026');
      pointerdownOn(fixture, '#test-panel-month-2026-6');

      expect(fixture.nativeElement.querySelectorAll('[role="grid"]').length).toBe(1);
      expect(fixture.nativeElement.querySelectorAll('[role="gridcell"]').length).toBe(42);
    });
  });
});

describe('DatePickerPanelComponent - drilldown mode', () => {
  it('opens on the year list, not the day grid', () => {
    const fixture = createPanel({ navigation: 'drilldown', initialViewDate: new Date(2026, 6, 15) });
    expect(fixture.nativeElement.querySelector('[role="listbox"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[role="grid"]')).toBeNull();
  });

  it('selecting a year moves to the month grid, then a month moves to the day grid', () => {
    const fixture = createPanel({ navigation: 'drilldown', initialViewDate: new Date(2026, 6, 15) });
    pointerdownOn(fixture, '#test-panel-year-2026');
    expect(gridCells(fixture).length).toBe(12);

    pointerdownOn(fixture, '#test-panel-month-2026-6'); // July
    expect(gridCells(fixture).length).toBe(42);
  });

  it('clicking the header goes back exactly one level (day -> month -> year)', () => {
    const fixture = createPanel({ navigation: 'drilldown', initialViewDate: new Date(2026, 6, 15) });
    pointerdownOn(fixture, '#test-panel-year-2026');
    pointerdownOn(fixture, '#test-panel-month-2026-6');
    expect(gridCells(fixture).length).toBe(42); // day view

    clickOn(fixture, 'button'); // day view's only button: the month/year header label
    expect(gridCells(fixture).length).toBe(12); // back to month view

    clickOn(fixture, 'button'); // month view's only button: the year header label
    expect(fixture.nativeElement.querySelector('[role="listbox"]')).not.toBeNull(); // back to year view
  });

  it('months wholly outside [minDate, maxDate] are aria-disabled', () => {
    const fixture = createPanel({
      navigation: 'drilldown',
      initialViewDate: new Date(2026, 6, 15),
      minDate: new Date(2026, 5, 1),
      maxDate: new Date(2026, 7, 31),
    });
    pointerdownOn(fixture, '#test-panel-year-2026');
    const disabledMonth = fixture.nativeElement.querySelector('#test-panel-month-2026-0'); // January, out of bounds
    expect(disabledMonth!.getAttribute('aria-disabled')).toBe('true');
    const enabledMonth = fixture.nativeElement.querySelector('#test-panel-month-2026-6'); // July, in bounds
    expect(enabledMonth!.getAttribute('aria-disabled')).toBeNull();
  });

  describe('range mode', () => {
    it('shows "Start date" initially and switches to "End date" after picking the first endpoint, resetting to the year list', () => {
      const fixture = createPanel({ selectionMode: 'range', navigation: 'drilldown', initialViewDate: new Date(2026, 6, 15) });
      expect(fixture.nativeElement.querySelector('p')!.textContent!.trim()).toBe('Start date');

      pointerdownOn(fixture, '#test-panel-year-2026');
      pointerdownOn(fixture, '#test-panel-month-2026-6');
      pointerdownOn(fixture, '#test-panel-day-2026-6-10');

      expect(fixture.nativeElement.querySelector('[role="listbox"]')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('p')!.textContent!.trim()).toBe('End date');
    });

    it('resets to the year list again once the range completes, ready for a fresh pick', () => {
      const fixture = createPanel({ selectionMode: 'range', navigation: 'drilldown', initialViewDate: new Date(2026, 6, 15) });
      const completed = jest.fn();
      fixture.componentInstance.rangeComplete.subscribe(completed);

      pointerdownOn(fixture, '#test-panel-year-2026');
      pointerdownOn(fixture, '#test-panel-month-2026-6');
      pointerdownOn(fixture, '#test-panel-day-2026-6-10');
      pointerdownOn(fixture, '#test-panel-year-2026');
      pointerdownOn(fixture, '#test-panel-month-2026-6');
      pointerdownOn(fixture, '#test-panel-day-2026-6-20');

      expect(completed).toHaveBeenCalledWith({ start: new Date(2026, 6, 10), end: new Date(2026, 6, 20) });
      expect(fixture.nativeElement.querySelector('[role="listbox"]')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('p')!.textContent!.trim()).toBe('Start date');
    });
  });
});

describe('DatePickerPanelComponent - pickerView="month"', () => {
  it('calendar mode: opens directly on the month grid, never a day grid', () => {
    const fixture = createPanel({ pickerView: 'month', initialViewDate: new Date(2026, 6, 15) });
    expect(gridCells(fixture).length).toBe(12);
    expect(fixture.nativeElement.querySelector('[role="listbox"]')).toBeNull();
  });

  it('calendar mode: picking a month emits dateSelect with its first day, instead of moving to a day grid', () => {
    const fixture = createPanel({ pickerView: 'month', initialViewDate: new Date(2026, 6, 15) });
    const selected = jest.fn();
    fixture.componentInstance.dateSelect.subscribe(selected);

    pointerdownOn(fixture, '#test-panel-month-2026-7'); // August
    expect(selected).toHaveBeenCalledWith(new Date(2026, 7, 1));
    expect(gridCells(fixture).length).toBe(12); // still the month grid, not a 42-cell day grid
  });

  it('calendar mode: pages by year via chevrons instead of by month', () => {
    const fixture = createPanel({ pickerView: 'month', initialViewDate: new Date(2026, 6, 15) });
    expect(activeContainer(fixture).getAttribute('aria-label')).toBe('2026');

    clickOn(fixture, 'button[aria-label="Next year"]');
    expect(activeContainer(fixture).getAttribute('aria-label')).toBe('2027');

    clickOn(fixture, 'button[aria-label="Previous year"]');
    clickOn(fixture, 'button[aria-label="Previous year"]');
    expect(activeContainer(fixture).getAttribute('aria-label')).toBe('2025');
  });

  it('drilldown mode: still starts on the year list, but a month pick commits directly instead of moving to a day grid', () => {
    const fixture = createPanel({ pickerView: 'month', navigation: 'drilldown', initialViewDate: new Date(2026, 6, 15) });
    expect(fixture.nativeElement.querySelector('[role="listbox"]')).not.toBeNull();
    const selected = jest.fn();
    fixture.componentInstance.dateSelect.subscribe(selected);

    pointerdownOn(fixture, '#test-panel-year-2026');
    expect(gridCells(fixture).length).toBe(12);

    pointerdownOn(fixture, '#test-panel-month-2026-6'); // July
    expect(selected).toHaveBeenCalledWith(new Date(2026, 6, 1));
    expect(gridCells(fixture).length).toBe(12); // never became a 42-cell day grid
  });

  it('highlights the month/year matching selectedValue', () => {
    const fixture = createPanel({ pickerView: 'month', selectedValue: new Date(2026, 6, 1), initialViewDate: new Date(2026, 6, 15) });
    const julyCell = fixture.nativeElement.querySelector('#test-panel-month-2026-6');
    expect(julyCell!.getAttribute('aria-selected')).toBe('true');
  });
});

describe('DatePickerPanelComponent - selectionMode="multiple"', () => {
  it('picking a day emits it added to selectedDates via multipleSelect, without removing anything', () => {
    const fixture = createPanel({ selectionMode: 'multiple', selectedDates: [new Date(2026, 6, 1)], initialViewDate: new Date(2026, 6, 15) });
    const emitted = jest.fn();
    fixture.componentInstance.multipleSelect.subscribe(emitted);

    pointerdownOn(fixture, '#test-panel-day-2026-6-10');
    expect(emitted).toHaveBeenCalledWith([new Date(2026, 6, 1), new Date(2026, 6, 10)]);
  });

  it('picking an already-selected day removes just that day', () => {
    const fixture = createPanel({
      selectionMode: 'multiple',
      selectedDates: [new Date(2026, 6, 1), new Date(2026, 6, 10)],
      initialViewDate: new Date(2026, 6, 15),
    });
    const emitted = jest.fn();
    fixture.componentInstance.multipleSelect.subscribe(emitted);

    pointerdownOn(fixture, '#test-panel-day-2026-6-1');
    expect(emitted).toHaveBeenCalledWith([new Date(2026, 6, 10)]);
  });

  it('marks every date in selectedDates as aria-selected, not just one', () => {
    const fixture = createPanel({
      selectionMode: 'multiple',
      selectedDates: [new Date(2026, 6, 1), new Date(2026, 6, 10)],
      initialViewDate: new Date(2026, 6, 15),
    });
    expect(fixture.nativeElement.querySelector('#test-panel-day-2026-6-1')!.getAttribute('aria-selected')).toBe('true');
    expect(fixture.nativeElement.querySelector('#test-panel-day-2026-6-10')!.getAttribute('aria-selected')).toBe('true');
    expect(fixture.nativeElement.querySelector('#test-panel-day-2026-6-15')!.getAttribute('aria-selected')).toBeNull();
  });

  it('does not emit rangeComplete or dateSelect (each selectionMode routes to exactly one output)', () => {
    const fixture = createPanel({ selectionMode: 'multiple', initialViewDate: new Date(2026, 6, 15) });
    const dateSelected = jest.fn();
    const rangeCompleted = jest.fn();
    fixture.componentInstance.dateSelect.subscribe(dateSelected);
    fixture.componentInstance.rangeComplete.subscribe(rangeCompleted);

    pointerdownOn(fixture, '#test-panel-day-2026-6-10');
    expect(dateSelected).not.toHaveBeenCalled();
    expect(rangeCompleted).not.toHaveBeenCalled();
  });
});

describe('DatePickerPanelComponent - parity features (DTP-017..DTP-021)', () => {
  it('DTP-017.S2: autoFocus="false" does not steal focus on mount', () => {
    const externalButton = document.createElement('button');
    externalButton.textContent = 'Focus holder';
    document.body.appendChild(externalButton);
    externalButton.focus();

    const fixture = createPanel({ autoFocus: false });
    expect(fixture.nativeElement.contains(document.activeElement)).toBe(false);
    expect(document.activeElement).toBe(externalButton);

    externalButton.remove();
  });

  it('DTP-018.S1: showButtonBar renders custom todayLabel/clearLabel, emits todayDate and clearRequested, and disables Today when out of bounds', () => {
    const today = new Date(2026, 6, 15);
    const fixture = createPanel({
      showButtonBar: true,
      todayDate: today,
      todayLabel: 'Jump Today',
      clearLabel: 'Reset',
    });
    const selected = jest.fn();
    const cleared = jest.fn();
    fixture.componentInstance.dateSelect.subscribe(selected);
    (fixture.componentInstance as unknown as { clearRequested: { subscribe: (fn: () => void) => void } }).clearRequested?.subscribe(cleared);

    const buttons = Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
    const todayBtn = buttons.find((b) => b.textContent?.trim() === 'Jump Today')!;
    const clearBtn = buttons.find((b) => b.textContent?.trim() === 'Reset')!;
    expect(todayBtn).toBeDefined();
    expect(clearBtn).toBeDefined();

    todayBtn.click();
    fixture.detectChanges();
    expect(selected).toHaveBeenCalledWith(today);

    clearBtn.click();
    fixture.detectChanges();
    expect(cleared).toHaveBeenCalledTimes(1);

    const blockedFixture = createPanel({
      showButtonBar: true,
      todayDate: new Date(2026, 6, 15),
      minDate: new Date(2026, 6, 20),
    });
    const blockedTodayBtn = Array.from(blockedFixture.nativeElement.querySelectorAll('button')).find((b) => (b as HTMLElement).textContent?.trim() === 'Today') as HTMLButtonElement;
    expect(blockedTodayBtn.disabled).toBe(true);
  });

  it('DTP-019.S1: pickerView="year" renders a 12-year decade grid, pages decades, and emits Jan 1 of the chosen year', () => {
    const fixture = createPanel({
      pickerView: 'year',
      initialViewDate: new Date(2026, 6, 15),
      previousDecadeLabel: 'Prev 10y',
      nextDecadeLabel: 'Next 10y',
    });
    const selected = jest.fn();
    fixture.componentInstance.dateSelect.subscribe(selected);

    const cells = gridCells(fixture);
    expect(cells.length).toBe(12);
    expect(cells[0].textContent?.trim()).toBe('2020');
    expect(cells[11].textContent?.trim()).toBe('2031');

    clickOn(fixture, 'button[aria-label="Prev 10y"]');
    const prevCells = gridCells(fixture);
    expect(prevCells[0].textContent?.trim()).toBe('2010');

    clickOn(fixture, 'button[aria-label="Next 10y"]');
    clickOn(fixture, 'button[aria-label="Next 10y"]');
    const nextCells = gridCells(fixture);
    expect(nextCells[0].textContent?.trim()).toBe('2030');

    pointerdownOn(fixture, '#test-panel-year-2034');
    expect(selected).toHaveBeenCalledWith(new Date(2034, 0, 1));
  });

  it('DTP-020.S1: timeOnly renders only time controls without grids and commits Date on hour/minute/period changes', () => {
    const fixture = createPanel({
      timeOnly: true,
      hourFormat: '12',
      todayDate: new Date(2026, 6, 15),
      initialViewDate: new Date(2026, 6, 15),
    });
    const selected = jest.fn();
    fixture.componentInstance.dateSelect.subscribe(selected);

    expect(fixture.nativeElement.querySelector('[role="grid"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[role="listbox"]')).toBeNull();

    const hourInput = fixture.nativeElement.querySelector('input[aria-label="Hour"]') as HTMLInputElement;
    const minuteInput = fixture.nativeElement.querySelector('input[aria-label="Minute"]') as HTMLInputElement;
    expect(hourInput).not.toBeNull();
    expect(minuteInput).not.toBeNull();

    hourInput.value = '8';
    hourInput.dispatchEvent(new Event('input'));
    minuteInput.value = '15';
    minuteInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(selected).toHaveBeenCalled();
    const lastDate = selected.mock.calls[selected.mock.calls.length - 1][0] as Date;
    expect(lastDate.getHours() % 12 || 12).toBe(8);
    expect(lastDate.getMinutes()).toBe(15);

    const periodBtn = Array.from(fixture.nativeElement.querySelectorAll('button')).find((b) => {
      const text = (b as HTMLElement).textContent?.trim();
      return text === 'AM' || text === 'PM';
    }) as HTMLButtonElement | undefined;
    expect(periodBtn).toBeDefined();
    const hoursBeforeToggle = lastDate.getHours();
    periodBtn!.click();
    fixture.detectChanges();
    const toggledDate = selected.mock.calls[selected.mock.calls.length - 1][0] as Date;
    expect(Math.abs(toggledDate.getHours() - hoursBeforeToggle)).toBe(12);

    const default24hFixture = createPanel({
      timeOnly: true,
      todayDate: new Date(2026, 6, 15),
      initialViewDate: new Date(2026, 6, 15),
    });
    const selected24h = jest.fn();
    default24hFixture.componentInstance.dateSelect.subscribe(selected24h);
    const hour24Input = default24hFixture.nativeElement.querySelector('input[aria-label="Hour"]') as HTMLInputElement;
    hour24Input.value = '17';
    hour24Input.dispatchEvent(new Event('input'));
    default24hFixture.detectChanges();
    const last24hDate = selected24h.mock.calls[selected24h.mock.calls.length - 1][0] as Date;
    expect(last24hDate.getHours()).toBe(17);
    const amPmBtn = Array.from(default24hFixture.nativeElement.querySelectorAll('button')).find((b) => {
      const text = (b as HTMLElement).textContent?.trim();
      return text === 'AM' || text === 'PM';
    });
    expect(amPmBtn).toBeUndefined();

    const inlineFixture = createPanel({ timeOnly: true, inline: true });
    const doneBtn = Array.from(inlineFixture.nativeElement.querySelectorAll('button')).find((b) => (b as HTMLElement).textContent?.trim() === 'Done');
    expect(doneBtn).toBeUndefined();
  });

  it('DTP-021.S1: dateTemplate renders custom cell content with accurate context fields', () => {
    @Component({
      standalone: true,
      imports: [DatePickerPanelComponent],
      template: `
        <ng-template #tpl let-dateObj let-day="date" let-today="today" let-outsideMonth="outsideMonth">
          <span class="panel-custom-day" [attr.data-day]="day" [attr.data-today]="today" [attr.data-outside]="outsideMonth">
            {{ day }}!
          </span>
        </ng-template>
        <med-date-picker-panel
          panelId="tpl-panel"
          [initialViewDate]="viewDate"
          [todayDate]="viewDate"
          [dateTemplate]="tplRef() ?? null"
        />
      `,
    })
    class PanelTemplateHost {
      readonly viewDate = new Date(2026, 6, 15);
      readonly tplRef = viewChild<TemplateRef<unknown>>('tpl');
    }

    const fixture = TestBed.createComponent(PanelTemplateHost);
    fixture.detectChanges();

    const todayCell = fixture.nativeElement.querySelector('#tpl-panel-day-2026-6-15 .panel-custom-day') as HTMLElement | null;
    expect(todayCell).not.toBeNull();
    expect(todayCell!.textContent?.trim()).toBe('15!');
    expect(todayCell!.getAttribute('data-today')).toBe('true');
    expect(todayCell!.getAttribute('data-outside')).toBe('false');
  });
});
