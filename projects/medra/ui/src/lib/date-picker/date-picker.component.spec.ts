import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DatePickerComponent } from './date-picker.component';
import { DatePickerValue } from './date-picker.types';

function trigger(fixture: ComponentFixture<unknown>): HTMLInputElement {
  return fixture.nativeElement.querySelector('[role="combobox"]') as HTMLInputElement;
}

function panelContainer(): HTMLElement | null {
  return document.querySelector('[role="grid"], [role="listbox"]');
}

function typeText(fixture: ComponentFixture<unknown>, text: string): void {
  const el = trigger(fixture);
  el.value = text;
  el.dispatchEvent(new Event('input'));
  fixture.detectChanges();
}

function keydown(fixture: ComponentFixture<unknown>, key: string): void {
  trigger(fixture).dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  fixture.detectChanges();
}

function blur(fixture: ComponentFixture<unknown>): void {
  trigger(fixture).dispatchEvent(new FocusEvent('blur', { bubbles: true }));
  fixture.detectChanges();
}

/** Day cell ids follow `${panelId}-day-${year}-${month}-${day}`; each visible month's grid id is `${panelId}-day-container-${offset}`. */
function dayCellId(day: number): string {
  const grid = document.querySelector('[role="grid"]') as HTMLElement;
  const panelId = grid.id.replace(/-day-container-\d+$/, '');
  return `${panelId}-day-2026-6-${day}`;
}

describe('DatePickerComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [OverlayModule] });
  });

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  function createDatePicker(): ComponentFixture<DatePickerComponent> {
    const fixture = TestBed.createComponent(DatePickerComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('writeValue displays the formatted date (single mode)', () => {
    const fixture = createDatePicker();
    fixture.componentInstance.writeValue(new Date(2026, 6, 5));
    fixture.detectChanges();
    expect(trigger(fixture).value).toBe('07/05/2026');
  });

  it('writeValue(null) shows an empty input, not a stray "null"', () => {
    const fixture = createDatePicker();
    fixture.componentInstance.writeValue(new Date(2026, 6, 5));
    fixture.detectChanges();
    fixture.componentInstance.writeValue(null);
    fixture.detectChanges();
    expect(trigger(fixture).value).toBe('');
  });

  it('falls back to a format-derived placeholder when none is supplied', () => {
    const fixture = createDatePicker();
    expect(trigger(fixture).placeholder).toBe('mm/dd/yyyy');
  });

  it('falls back to a two-sided format-derived placeholder in range mode', () => {
    const fixture = createDatePicker();
    fixture.componentRef.setInput('selectionMode', 'range');
    fixture.detectChanges();
    expect(trigger(fixture).placeholder).toBe('mm/dd/yyyy - mm/dd/yyyy');
  });

  it('an explicit placeholder input overrides the format-derived default', () => {
    const fixture = createDatePicker();
    fixture.componentRef.setInput('placeholder', 'Pick a date');
    fixture.detectChanges();
    expect(trigger(fixture).placeholder).toBe('Pick a date');
  });

  it('defaults numberOfMonths to 2 in range mode and 1 in single mode, forwarding it to the panel', () => {
    const fixture = createDatePicker();
    keydown(fixture, 'ArrowDown');
    expect(document.querySelectorAll('[role="grid"]').length).toBe(1);
    keydown(fixture, 'Escape');

    fixture.componentRef.setInput('selectionMode', 'range');
    fixture.detectChanges();
    keydown(fixture, 'ArrowDown');
    expect(document.querySelectorAll('[role="grid"]').length).toBe(2);
  });

  it('an explicit numberOfMonths overrides the mode-aware default', () => {
    const fixture = createDatePicker();
    fixture.componentRef.setInput('numberOfMonths', 3);
    fixture.detectChanges();
    keydown(fixture, 'ArrowDown');
    expect(document.querySelectorAll('[role="grid"]').length).toBe(3);
  });

  it('never commits typed text landing on a disabledDates/disabledDays entry', () => {
    const fixture = createDatePicker();
    fixture.componentRef.setInput('disabledDates', [new Date(2026, 6, 18)]);
    fixture.componentRef.setInput('disabledDays', [0]); // Sunday
    const received: DatePickerValue[] = [];
    fixture.componentInstance.registerOnChange((value) => received.push(value));
    fixture.detectChanges();

    typeText(fixture, '07/18/2026'); // specific disabledDates entry
    expect(received).toEqual([]);

    typeText(fixture, '07/19/2026'); // a Sunday, disabledDays
    expect(received).toEqual([]);

    typeText(fixture, '07/20/2026'); // a plain Monday, neither excluded
    expect(received).toEqual([new Date(2026, 6, 20)]);
  });

  it('typing a valid date commits it live via onChange, without waiting for blur', () => {
    const fixture = createDatePicker();
    const received: DatePickerValue[] = [];
    fixture.componentInstance.registerOnChange((value) => received.push(value));

    typeText(fixture, '07/05/2026');

    expect(received).toEqual([new Date(2026, 6, 5)]);
  });

  it('never commits unparseable text, and reverts the displayed text to the last committed value on blur', () => {
    const fixture = createDatePicker();
    fixture.componentInstance.writeValue(new Date(2026, 6, 5));
    const received: DatePickerValue[] = [];
    fixture.componentInstance.registerOnChange((value) => received.push(value));
    fixture.detectChanges();

    typeText(fixture, 'nonsense');
    expect(received).toEqual([]);
    expect(trigger(fixture).value).toBe('nonsense');

    blur(fixture);
    expect(trigger(fixture).value).toBe('07/05/2026');
  });

  it('never commits a date outside [minDate, maxDate], reverting on blur the same way as unparseable text', () => {
    const fixture = createDatePicker();
    fixture.componentRef.setInput('minDate', new Date(2026, 6, 10));
    fixture.componentRef.setInput('maxDate', new Date(2026, 6, 20));
    fixture.componentInstance.writeValue(new Date(2026, 6, 15));
    const received: DatePickerValue[] = [];
    fixture.componentInstance.registerOnChange((value) => received.push(value));
    fixture.detectChanges();

    typeText(fixture, '07/25/2026'); // parses fine, but outside maxDate

    expect(received).toEqual([]);
    blur(fixture);
    expect(trigger(fixture).value).toBe('07/15/2026');
  });

  it('Enter reformats the displayed text immediately, without needing blur', () => {
    const fixture = createDatePicker();
    typeText(fixture, '7/5/2026');
    keydown(fixture, 'Enter');
    expect(trigger(fixture).value).toBe('07/05/2026');
  });

  it('ArrowDown opens the calendar panel and moves real focus into it', () => {
    const fixture = createDatePicker();
    keydown(fixture, 'ArrowDown');
    const panel = panelContainer();
    expect(panel).not.toBeNull();
    expect(document.activeElement).toBe(panel);
  });

  it('Escape closes the panel without changing the committed value', () => {
    const fixture = createDatePicker();
    fixture.componentInstance.writeValue(new Date(2026, 6, 5));
    fixture.detectChanges();

    keydown(fixture, 'ArrowDown');
    expect(panelContainer()).not.toBeNull();

    keydown(fixture, 'Escape');
    expect(panelContainer()).toBeNull();
    expect(trigger(fixture).value).toBe('07/05/2026');
  });

  it('selecting a day in the panel commits the value and closes the panel (single mode)', () => {
    const fixture = createDatePicker();
    fixture.componentInstance.writeValue(new Date(2026, 6, 15));
    const received: DatePickerValue[] = [];
    fixture.componentInstance.registerOnChange((value) => received.push(value));
    fixture.detectChanges();

    keydown(fixture, 'ArrowDown');
    const cell = document.getElementById(dayCellId(20)) as HTMLElement;
    cell.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(received).toEqual([new Date(2026, 6, 20)]);
    expect(trigger(fixture).value).toBe('07/20/2026');
    expect(panelContainer()).toBeNull();
  });

  it('picking a range closes the panel once both endpoints are selected', () => {
    const fixture = createDatePicker();
    fixture.componentRef.setInput('selectionMode', 'range');
    // Seeds the panel to open on July 2026, same as every other test using
    // dayCellId() (which hardcodes that year/month) — without a seed the
    // panel opens on today's month instead, so the constructed cell id
    // wouldn't match any element actually in the DOM.
    fixture.componentInstance.writeValue({ start: new Date(2026, 6, 1), end: null });
    fixture.detectChanges();

    keydown(fixture, 'ArrowDown');
    let cell = document.getElementById(dayCellId(10)) as HTMLElement;
    cell.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(panelContainer()).not.toBeNull();

    cell = document.getElementById(dayCellId(20)) as HTMLElement;
    cell.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(panelContainer()).toBeNull();
    expect(trigger(fixture).value).toBe('07/10/2026 - 07/20/2026');
  });

  it('forwards minDate/maxDate to the panel, disabling out-of-range days', () => {
    const fixture = createDatePicker();
    fixture.componentRef.setInput('minDate', new Date(2026, 6, 10));
    fixture.componentRef.setInput('maxDate', new Date(2026, 6, 20));
    fixture.componentInstance.writeValue(new Date(2026, 6, 15));
    fixture.detectChanges();

    keydown(fixture, 'ArrowDown');
    const outOfRangeCell = document.getElementById(dayCellId(5));
    expect(outOfRangeCell?.getAttribute('aria-disabled')).toBe('true');
  });

  describe('showClear', () => {
    it('clears the value, empties the text, and refocuses the input', () => {
      const fixture = createDatePicker();
      fixture.componentRef.setInput('showClear', true);
      fixture.componentInstance.writeValue(new Date(2026, 6, 5));
      const received: DatePickerValue[] = [];
      fixture.componentInstance.registerOnChange((value) => received.push(value));
      fixture.detectChanges();

      const clearButton = fixture.nativeElement.querySelector('button[aria-label="Clear"]') as HTMLButtonElement;
      clearButton.click();
      fixture.detectChanges();

      expect(received).toEqual([null]);
      expect(trigger(fixture).value).toBe('');
      expect(document.activeElement).toBe(trigger(fixture));
    });

    it('is not shown when nothing is selected', () => {
      const fixture = createDatePicker();
      fixture.componentRef.setInput('showClear', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('button[aria-label="Clear"]')).toBeNull();
    });
  });

  it('a disabled DatePicker has a real disabled input (unlike Select\'s aria-disabled, since this is a genuine <input>) and ignores ArrowDown', () => {
    const fixture = createDatePicker();
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    expect(trigger(fixture).disabled).toBe(true);

    keydown(fixture, 'ArrowDown');
    expect(panelContainer()).toBeNull();
  });

  it('setDisabledState(true) (Reactive Forms disable()) disables the input', () => {
    const fixture = createDatePicker();
    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();
    expect(trigger(fixture).disabled).toBe(true);
  });

  describe('range mode input semantics', () => {
    it('is readOnly, not disabled, and a plain click opens the panel', () => {
      const fixture = createDatePicker();
      fixture.componentRef.setInput('selectionMode', 'range');
      fixture.detectChanges();

      expect(trigger(fixture).readOnly).toBe(true);
      expect(trigger(fixture).disabled).toBe(false);

      trigger(fixture).dispatchEvent(new MouseEvent('click', { bubbles: true }));
      fixture.detectChanges();

      expect(panelContainer()).not.toBeNull();
    });
  });

  it('single mode: a plain click does not open the panel, leaving the caret free to place for editing', () => {
    const fixture = createDatePicker();
    trigger(fixture).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    expect(panelContainer()).toBeNull();
  });

  it('a FormControl seeded with a value displays its formatted text on init', () => {
    @Component({
      standalone: true,
      imports: [DatePickerComponent, ReactiveFormsModule],
      template: `<med-date-picker [formControl]="control" />`,
    })
    class HostComponent {
      readonly control = new FormControl<Date | null>(new Date(2026, 6, 5));
    }

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(trigger(fixture).value).toBe('07/05/2026');
  });

  describe('showTime', () => {
    function hourInput(): HTMLInputElement {
      return document.querySelector('input[aria-label="Hour"]') as HTMLInputElement;
    }
    function minuteInput(): HTMLInputElement {
      return document.querySelector('input[aria-label="Minute"]') as HTMLInputElement;
    }
    function doneButton(): HTMLButtonElement {
      return Array.from(document.querySelectorAll('button')).find((btn) => btn.textContent?.trim() === 'Done') as HTMLButtonElement;
    }

    it('appends a 24-hour time suffix to the displayed text', () => {
      const fixture = createDatePicker();
      fixture.componentRef.setInput('showTime', true);
      fixture.componentInstance.writeValue(new Date(2026, 6, 5, 14, 5));
      fixture.detectChanges();
      expect(trigger(fixture).value).toBe('07/05/2026 14:05');
    });

    it('appends a 12-hour time suffix with AM/PM when hourFormat is 12', () => {
      const fixture = createDatePicker();
      fixture.componentRef.setInput('showTime', true);
      fixture.componentRef.setInput('hourFormat', '12');
      fixture.componentInstance.writeValue(new Date(2026, 6, 5, 14, 5));
      fixture.detectChanges();
      expect(trigger(fixture).value).toBe('07/05/2026 2:05 PM');
    });

    it('makes the input readOnly (datetime is never typed as free text) and a plain click opens the panel', () => {
      const fixture = createDatePicker();
      fixture.componentRef.setInput('showTime', true);
      fixture.detectChanges();

      expect(trigger(fixture).readOnly).toBe(true);
      trigger(fixture).dispatchEvent(new MouseEvent('click', { bubbles: true }));
      fixture.detectChanges();
      expect(panelContainer()).not.toBeNull();
    });

    it('picking a day does not close the panel, so the user can still dial in a time', () => {
      const fixture = createDatePicker();
      fixture.componentRef.setInput('showTime', true);
      fixture.componentInstance.writeValue(new Date(2026, 6, 15));
      fixture.detectChanges();

      keydown(fixture, 'ArrowDown');
      const cell = document.getElementById(dayCellId(20)) as HTMLElement;
      cell.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));
      fixture.detectChanges();

      expect(panelContainer()).not.toBeNull();
      expect(trigger(fixture).value).toBe('07/20/2026 00:00');
    });

    it('the panel\'s Done button commits and closes', () => {
      const fixture = createDatePicker();
      fixture.componentRef.setInput('showTime', true);
      fixture.componentInstance.writeValue(new Date(2026, 6, 15));
      fixture.detectChanges();

      keydown(fixture, 'ArrowDown');
      doneButton().click();
      fixture.detectChanges();

      expect(panelContainer()).toBeNull();
    });

    it('changing the hour/minute inputs commits an updated value once a day is already selected', () => {
      const fixture = createDatePicker();
      fixture.componentRef.setInput('showTime', true);
      fixture.componentInstance.writeValue(new Date(2026, 6, 15));
      const received: DatePickerValue[] = [];
      fixture.componentInstance.registerOnChange((value) => received.push(value));
      fixture.detectChanges();

      keydown(fixture, 'ArrowDown');
      const hour = hourInput();
      hour.value = '9';
      hour.dispatchEvent(new Event('input'));
      const minute = minuteInput();
      minute.value = '45';
      minute.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // Each field commits live on its own input event (same "live on every
      // keystroke" precedent as free-text typing above), so the hour change
      // emits its own intermediate value before the minute change emits the
      // final one.
      expect(received).toEqual([new Date(2026, 6, 15, 9, 0), new Date(2026, 6, 15, 9, 45)]);
      expect(trigger(fixture).value).toBe('07/15/2026 09:45');
    });

    it('the AM/PM toggle button flips the period in 12-hour format', () => {
      const fixture = createDatePicker();
      fixture.componentRef.setInput('showTime', true);
      fixture.componentRef.setInput('hourFormat', '12');
      fixture.componentInstance.writeValue(new Date(2026, 6, 15, 9, 0));
      const received: DatePickerValue[] = [];
      fixture.componentInstance.registerOnChange((value) => received.push(value));
      fixture.detectChanges();

      keydown(fixture, 'ArrowDown');
      expect(hourInput().value).toBe('9');
      const periodButton = Array.from(document.querySelectorAll('button')).find((btn) => btn.textContent?.trim() === 'AM') as HTMLButtonElement;
      periodButton.click();
      fixture.detectChanges();

      expect(received).toEqual([new Date(2026, 6, 15, 21, 0)]);
      expect(trigger(fixture).value).toBe('07/15/2026 9:00 PM');
    });

    it('is ignored in range mode (documented cut)', () => {
      const fixture = createDatePicker();
      fixture.componentRef.setInput('selectionMode', 'range');
      fixture.componentRef.setInput('showTime', true);
      fixture.detectChanges();

      keydown(fixture, 'ArrowDown');
      expect(hourInput()).toBeNull();
    });
  });

  describe('view="month"', () => {
    it('placeholder defaults to mm/yyyy', () => {
      const fixture = createDatePicker();
      fixture.componentRef.setInput('view', 'month');
      fixture.detectChanges();
      expect(trigger(fixture).placeholder).toBe('mm/yyyy');
    });

    it('is readOnly, and a plain click opens the panel', () => {
      const fixture = createDatePicker();
      fixture.componentRef.setInput('view', 'month');
      fixture.detectChanges();

      expect(trigger(fixture).readOnly).toBe(true);
      trigger(fixture).dispatchEvent(new MouseEvent('click', { bubbles: true }));
      fixture.detectChanges();
      expect(panelContainer()).not.toBeNull();
    });

    it('formats the committed value as a localized month/year, not the numeric dateFormat', () => {
      const fixture = createDatePicker();
      fixture.componentRef.setInput('view', 'month');
      fixture.componentInstance.writeValue(new Date(2026, 6, 1));
      fixture.detectChanges();
      expect(trigger(fixture).value).toBe('July 2026');
    });

    it('calendar mode: opens directly on a month grid, and picking a month commits its first day and closes the panel', () => {
      const fixture = createDatePicker();
      fixture.componentRef.setInput('view', 'month');
      fixture.componentInstance.writeValue(new Date(2026, 6, 5)); // seeds the panel to open on 2026
      const received: DatePickerValue[] = [];
      fixture.componentInstance.registerOnChange((value) => received.push(value));
      fixture.detectChanges();

      keydown(fixture, 'ArrowDown');
      const grid = document.querySelector('[role="grid"]') as HTMLElement;
      expect(grid).not.toBeNull();
      expect(grid.querySelectorAll('[role="gridcell"]').length).toBe(12);

      const augustCell = Array.from(grid.querySelectorAll('[role="gridcell"]')).find((el) => el.textContent?.trim() === 'Aug') as HTMLElement;
      augustCell.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));
      fixture.detectChanges();

      expect(received).toEqual([new Date(2026, 7, 1)]);
      expect(trigger(fixture).value).toBe('August 2026');
      expect(panelContainer()).toBeNull();
    });

    it('drilldown mode: still starts on the year list, then commits directly from the month grid, never showing a day grid', () => {
      const fixture = createDatePicker();
      fixture.componentRef.setInput('view', 'month');
      fixture.componentRef.setInput('navigation', 'drilldown');
      fixture.componentInstance.writeValue(new Date(2026, 6, 5));
      const received: DatePickerValue[] = [];
      fixture.componentInstance.registerOnChange((value) => received.push(value));
      fixture.detectChanges();

      keydown(fixture, 'ArrowDown');
      const yearList = document.querySelector('[role="listbox"]') as HTMLElement;
      expect(yearList).not.toBeNull();
      const panelId = yearList.id.replace(/-year-container$/, '');
      const yearRow = document.getElementById(`${panelId}-year-2026`) as HTMLElement;
      yearRow.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));
      fixture.detectChanges();

      const monthGrid = document.querySelector('[role="grid"]') as HTMLElement;
      expect(monthGrid).not.toBeNull();
      const augustCell = Array.from(monthGrid.querySelectorAll('[role="gridcell"]')).find((el) => el.textContent?.trim() === 'Aug') as HTMLElement;
      augustCell.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));
      fixture.detectChanges();

      expect(received).toEqual([new Date(2026, 7, 1)]);
      expect(panelContainer()).toBeNull();
    });
  });

  describe('selectionMode="multiple"', () => {
    it('writeValue displays the dates joined by multipleSeparator', () => {
      const fixture = createDatePicker();
      fixture.componentRef.setInput('selectionMode', 'multiple');
      fixture.componentInstance.writeValue([new Date(2026, 6, 5), new Date(2026, 6, 12)]);
      fixture.detectChanges();
      expect(trigger(fixture).value).toBe('07/05/2026, 07/12/2026');
    });

    it('is readOnly, and a plain click opens the panel', () => {
      const fixture = createDatePicker();
      fixture.componentRef.setInput('selectionMode', 'multiple');
      fixture.detectChanges();

      expect(trigger(fixture).readOnly).toBe(true);
      trigger(fixture).dispatchEvent(new MouseEvent('click', { bubbles: true }));
      fixture.detectChanges();
      expect(panelContainer()).not.toBeNull();
    });

    it('picking days in the panel adds them without closing it, and picking an already-selected day removes it', () => {
      const fixture = createDatePicker();
      fixture.componentRef.setInput('selectionMode', 'multiple');
      fixture.componentInstance.writeValue([new Date(2026, 6, 1)]); // seeds the panel to open on July 2026
      const received: DatePickerValue[] = [];
      fixture.componentInstance.registerOnChange((value) => received.push(value));
      fixture.detectChanges();

      keydown(fixture, 'ArrowDown');
      let cell = document.getElementById(dayCellId(10)) as HTMLElement;
      cell.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));
      fixture.detectChanges();
      expect(panelContainer()).not.toBeNull(); // still open
      expect(received[received.length - 1]).toEqual([new Date(2026, 6, 1), new Date(2026, 6, 10)]);

      cell = document.getElementById(dayCellId(1)) as HTMLElement; // remove the originally-seeded date
      cell.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));
      fixture.detectChanges();
      expect(received[received.length - 1]).toEqual([new Date(2026, 6, 10)]);
      expect(trigger(fixture).value).toBe('07/10/2026');
    });

    describe('showClear', () => {
      it('clears the array', () => {
        const fixture = createDatePicker();
        fixture.componentRef.setInput('selectionMode', 'multiple');
        fixture.componentRef.setInput('showClear', true);
        fixture.componentInstance.writeValue([new Date(2026, 6, 5)]);
        const received: DatePickerValue[] = [];
        fixture.componentInstance.registerOnChange((value) => received.push(value));
        fixture.detectChanges();

        const clearButton = fixture.nativeElement.querySelector('button[aria-label="Clear"]') as HTMLButtonElement;
        clearButton.click();
        fixture.detectChanges();

        expect(received).toEqual([[]]);
        expect(trigger(fixture).value).toBe('');
      });
    });
  });

  it('destroying the component while the panel is open closes the overlay', () => {
    const fixture = createDatePicker();
    keydown(fixture, 'ArrowDown');
    expect(panelContainer()).not.toBeNull();

    fixture.destroy();

    expect(panelContainer()).toBeNull();
  });
});
