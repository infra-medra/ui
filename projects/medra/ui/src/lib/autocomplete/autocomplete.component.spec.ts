import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AutocompleteComponent } from './autocomplete.component';
import { SelectOption } from '../select/select.types';

const FRUITS: SelectOption<string>[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry', disabled: true },
];

function trigger(fixture: ComponentFixture<unknown>): HTMLInputElement {
  return fixture.nativeElement.querySelector('[role="combobox"]') as HTMLInputElement;
}

function listbox(): HTMLElement | null {
  return document.querySelector('[role="listbox"]');
}

function typeText(fixture: ComponentFixture<unknown>, text: string) {
  const el = trigger(fixture);
  el.value = text;
  el.dispatchEvent(new Event('input'));
  fixture.detectChanges();
}

function keydown(fixture: ComponentFixture<unknown>, key: string) {
  trigger(fixture).dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  fixture.detectChanges();
}

describe('AutocompleteComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [OverlayModule] });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  function createAutocomplete() {
    const fixture = TestBed.createComponent(AutocompleteComponent<string>);
    fixture.detectChanges();
    return fixture;
  }

  it('does not emit search below minLength', () => {
    const fixture = createAutocomplete();
    const search = jest.fn();
    fixture.componentInstance.search.subscribe(search);

    typeText(fixture, '');
    jest.runAllTimers();

    expect(search).not.toHaveBeenCalled();
    expect(listbox()).toBeNull();
  });

  it('emits search (debounced by searchDelay) once minLength is reached, and opens the panel once suggestions arrive', () => {
    const fixture = createAutocomplete();
    const queries: string[] = [];
    fixture.componentInstance.search.subscribe((query) => queries.push(query));

    typeText(fixture, 'an');
    jest.advanceTimersByTime(299);
    expect(queries).toEqual([]);

    jest.advanceTimersByTime(1);
    fixture.detectChanges();
    expect(queries).toEqual(['an']);
    expect(listbox()).not.toBeNull();

    // Simulate the consumer's reaction to (search): filter and push suggestions back in.
    fixture.componentRef.setInput(
      'suggestions',
      FRUITS.filter((option) => option.label.toLowerCase().includes('an')),
    );
    fixture.detectChanges();

    expect(listbox()!.textContent).toContain('Banana');
  });

  it('defers opening the panel while loading, instead of showing the previous query\'s stale suggestions first', () => {
    const fixture = createAutocomplete();
    fixture.componentRef.setInput('suggestions', [{ label: 'Banana', value: 'banana' }]); // stale match from a previous query
    fixture.detectChanges();

    typeText(fixture, 'g'); // a new query — matches nothing, but that isn't known yet
    fixture.componentRef.setInput('loading', true); // consumer's synchronous reaction to (search), same as the real flow
    jest.runAllTimers();
    fixture.detectChanges();

    expect(listbox()).toBeNull(); // no panel at all yet — not even the stale "Banana" — while still loading

    // The consumer's fetch resolves: real (empty, for "g") suggestions land, loading clears.
    fixture.componentRef.setInput('suggestions', []);
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();

    expect(listbox()).not.toBeNull();
    expect(listbox()!.textContent).not.toContain('Banana');
    expect(listbox()!.textContent).toContain('No results found');
  });

  it('opens right away once debounce fires when loading is never used (synchronous local filter)', () => {
    const fixture = createAutocomplete();
    const queries: string[] = [];
    fixture.componentInstance.search.subscribe((query) => queries.push(query));

    typeText(fixture, 'an');
    jest.runAllTimers();
    // Simulate a consumer that filters synchronously in its (search) handler —
    // by the time the debounce timeout fires, `suggestions` is already fresh,
    // so there's nothing to defer opening for.
    fixture.componentRef.setInput(
      'suggestions',
      FRUITS.filter((option) => option.label.toLowerCase().includes('an')),
    );
    fixture.detectChanges();

    expect(listbox()).not.toBeNull();
    expect(listbox()!.textContent).toContain('Banana');
  });

  it('retyping resets the debounce timer instead of firing once per keystroke', () => {
    const fixture = createAutocomplete();
    const queries: string[] = [];
    fixture.componentInstance.search.subscribe((query) => queries.push(query));

    typeText(fixture, 'a');
    jest.advanceTimersByTime(200);
    typeText(fixture, 'an');
    jest.advanceTimersByTime(200);
    expect(queries).toEqual([]);

    jest.advanceTimersByTime(100);
    expect(queries).toEqual(['an']);
  });

  it('selecting a suggestion by click sets the value, fills the input, and closes the panel', () => {
    const fixture = createAutocomplete();
    fixture.componentRef.setInput('suggestions', FRUITS);
    const received: (SelectOption<string> | null)[] = [];
    fixture.componentInstance.registerOnChange((value) => received.push(value as SelectOption<string> | null));

    typeText(fixture, 'an');
    jest.runAllTimers();
    fixture.detectChanges();

    const row = document.querySelectorAll('[role="option"]')[1] as HTMLElement; // Banana
    row.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(received).toEqual([{ label: 'Banana', value: 'banana' }]);
    expect(trigger(fixture).value).toBe('Banana');
    expect(listbox()).toBeNull();
  });

  it('selecting a suggestion by keyboard (ArrowDown + Enter) works the same way, and skips disabled options', () => {
    const fixture = createAutocomplete();
    fixture.componentRef.setInput('suggestions', FRUITS);
    const received: (SelectOption<string> | null)[] = [];
    fixture.componentInstance.registerOnChange((value) => received.push(value as SelectOption<string> | null));

    typeText(fixture, 'a');
    jest.runAllTimers();
    fixture.detectChanges();

    expect(trigger(fixture).getAttribute('aria-activedescendant')).toMatch(/-option-0$/); // apple
    keydown(fixture, 'ArrowDown'); // -> banana(1)
    keydown(fixture, 'ArrowDown'); // cherry(2) is disabled, wraps back to apple(0)
    expect(trigger(fixture).getAttribute('aria-activedescendant')).toMatch(/-option-0$/);

    keydown(fixture, 'ArrowUp'); // apple(0) -> wraps to last enabled: banana(1) (cherry disabled)
    keydown(fixture, 'Enter');

    expect(received).toEqual([{ label: 'Banana', value: 'banana' }]);
    expect(listbox()).toBeNull();
  });

  it('Escape closes the panel without changing the value', () => {
    const fixture = createAutocomplete();
    fixture.componentRef.setInput('suggestions', FRUITS);
    const search = jest.fn();
    fixture.componentInstance.search.subscribe(search);

    typeText(fixture, 'an');
    jest.runAllTimers();
    fixture.detectChanges();
    expect(listbox()).not.toBeNull();

    keydown(fixture, 'Escape');

    expect(listbox()).toBeNull();
  });

  it('editing the text after a selection clears the committed value', () => {
    const fixture = createAutocomplete();
    fixture.componentRef.setInput('suggestions', FRUITS);
    const received: (SelectOption<string> | null)[] = [];
    fixture.componentInstance.registerOnChange((value) => received.push(value as SelectOption<string> | null));

    typeText(fixture, 'an');
    jest.runAllTimers();
    fixture.detectChanges();
    keydown(fixture, 'Enter'); // apple, the first (enabled) active option
    expect(received).toEqual([{ label: 'Apple', value: 'apple' }]);

    typeText(fixture, 'anb');

    expect(received).toEqual([{ label: 'Apple', value: 'apple' }, null]);
  });

  it('writeValue(null) shows the placeholder text, not a stray label', () => {
    const fixture = createAutocomplete();
    const component = fixture.componentInstance;
    component.writeValue({ label: 'Banana', value: 'banana' });
    fixture.detectChanges();
    expect(trigger(fixture).value).toBe('Banana');

    component.writeValue(null);
    fixture.detectChanges();

    expect(trigger(fixture).value).toBe('');
  });

  it('a FormControl seeded with a value displays its label on init (real-world regression scenario)', () => {
    @Component({
      standalone: true,
      imports: [AutocompleteComponent, ReactiveFormsModule],
      template: `<med-autocomplete [formControl]="control" />`,
    })
    class HostComponent {
      readonly control = new FormControl<SelectOption<string> | null>({ label: 'Banana', value: 'banana' });
    }

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(trigger(fixture).value).toBe('Banana');
  });

  describe('showClear', () => {
    it('clears the value and text without leaving the panel open', () => {
      const fixture = createAutocomplete();
      fixture.componentRef.setInput('showClear', true);
      const received: (SelectOption<string> | null)[] = [];
      fixture.componentInstance.registerOnChange((value) => received.push(value as SelectOption<string> | null));
      fixture.componentInstance.writeValue({ label: 'Banana', value: 'banana' });
      fixture.detectChanges();

      const clearButton = fixture.nativeElement.querySelector('button[aria-label="Clear"]') as HTMLButtonElement;
      clearButton.click();
      fixture.detectChanges();

      expect(received).toEqual([null]);
      expect(trigger(fixture).value).toBe('');
      expect(listbox()).toBeNull();
    });

    it('is not shown when nothing is selected', () => {
      const fixture = createAutocomplete();
      fixture.componentRef.setInput('showClear', true);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('button[aria-label="Clear"]')).toBeNull();
    });
  });

  describe('dropdown', () => {
    it('is not rendered by default', () => {
      const fixture = createAutocomplete();
      expect(fixture.nativeElement.querySelector('button[aria-label="Show suggestions"]')).toBeNull();
    });

    it('clicking it while closed searches with an empty string immediately, bypassing minLength and searchDelay', () => {
      const fixture = createAutocomplete();
      fixture.componentRef.setInput('dropdown', true);
      fixture.componentRef.setInput('minLength', 3);
      fixture.detectChanges();
      const queries: string[] = [];
      fixture.componentInstance.search.subscribe((query) => queries.push(query));

      const dropdownButton = fixture.nativeElement.querySelector('button[aria-label="Show suggestions"]') as HTMLButtonElement;
      dropdownButton.click();

      expect(queries).toEqual(['']); // no jest.advanceTimersByTime needed — no debounce on a click
    });

    it('opens the panel once suggestions for the empty-string search arrive', () => {
      const fixture = createAutocomplete();
      fixture.componentRef.setInput('dropdown', true);
      fixture.detectChanges();

      const dropdownButton = fixture.nativeElement.querySelector('button[aria-label="Show suggestions"]') as HTMLButtonElement;
      dropdownButton.click();
      fixture.componentRef.setInput('suggestions', FRUITS);
      fixture.detectChanges();

      expect(listbox()).not.toBeNull();
    });

    it('clicking it while open just closes the panel, without emitting a new search', () => {
      const fixture = createAutocomplete();
      fixture.componentRef.setInput('dropdown', true);
      fixture.componentRef.setInput('suggestions', FRUITS);
      fixture.detectChanges();
      const search = jest.fn();
      fixture.componentInstance.search.subscribe(search);

      const dropdownButton = fixture.nativeElement.querySelector('button[aria-label="Show suggestions"]') as HTMLButtonElement;
      dropdownButton.click(); // opens
      fixture.detectChanges();
      expect(listbox()).not.toBeNull();

      dropdownButton.click(); // closes
      fixture.detectChanges();
      expect(listbox()).toBeNull();
      expect(search).toHaveBeenCalledTimes(1); // only the opening click, not the closing one
    });

    it('is disabled and inert when the component is disabled', () => {
      const fixture = createAutocomplete();
      fixture.componentRef.setInput('dropdown', true);
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      const search = jest.fn();
      fixture.componentInstance.search.subscribe(search);

      const dropdownButton = fixture.nativeElement.querySelector('button[aria-label="Show suggestions"]') as HTMLButtonElement;
      expect(dropdownButton.disabled).toBe(true);
      dropdownButton.click();
      expect(search).not.toHaveBeenCalled();
    });
  });

  it('a disabled Autocomplete ignores typing and never opens', () => {
    const fixture = createAutocomplete();
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    expect(trigger(fixture).disabled).toBe(true);

    keydown(fixture, 'ArrowDown');

    expect(listbox()).toBeNull();
  });

  it('setDisabledState(true) (Reactive Forms disable()) disables the input', () => {
    const fixture = createAutocomplete();
    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();

    expect(trigger(fixture).disabled).toBe(true);
  });

  it('destroying the component while the panel is open closes the overlay', () => {
    const fixture = createAutocomplete();
    typeText(fixture, 'an');
    jest.runAllTimers();
    fixture.detectChanges();
    expect(listbox()).not.toBeNull();

    fixture.destroy();

    expect(listbox()).toBeNull();
  });

  describe('multiple', () => {
    function createMultiple() {
      const fixture = TestBed.createComponent(AutocompleteComponent<string>);
      fixture.componentRef.setInput('multiple', true);
      fixture.detectChanges();
      return fixture;
    }

    function chips(fixture: ComponentFixture<unknown>): HTMLElement[] {
      return Array.from(fixture.nativeElement.querySelectorAll('med-chip'));
    }

    function selectRow(fixture: ComponentFixture<unknown>, index: number) {
      (document.querySelectorAll('[role="option"]')[index] as HTMLElement).dispatchEvent(
        new MouseEvent('pointerdown', { bubbles: true, cancelable: true }),
      );
      fixture.detectChanges();
    }

    it('selecting a suggestion appends a chip, clears the query, and closes the panel', () => {
      const fixture = createMultiple();
      fixture.componentRef.setInput('suggestions', FRUITS);
      const received: (readonly SelectOption<string>[])[] = [];
      fixture.componentInstance.registerOnChange((value) => (received as SelectOption<string>[][]).push([...(value as SelectOption<string>[])]));

      typeText(fixture, 'an');
      jest.runAllTimers();
      fixture.detectChanges();
      selectRow(fixture, 1); // Banana

      expect(chips(fixture).map((c) => c.textContent?.trim())).toEqual(['Banana']);
      expect(received).toEqual([[{ label: 'Banana', value: 'banana' }]]);
      expect(trigger(fixture).value).toBe(''); // query cleared, ready for the next search
      expect(listbox()).toBeNull();
    });

    it('picking the same suggestion twice never adds a duplicate chip', () => {
      const fixture = createMultiple();
      fixture.componentRef.setInput('suggestions', FRUITS);

      typeText(fixture, 'an');
      jest.runAllTimers();
      fixture.detectChanges();
      selectRow(fixture, 1); // Banana

      typeText(fixture, 'an');
      jest.runAllTimers();
      fixture.detectChanges();
      selectRow(fixture, 1); // Banana again

      expect(chips(fixture)).toHaveLength(1);
    });

    it("removing a chip removes just that selection and calls onChange, without affecting the query text", () => {
      const fixture = createMultiple();
      fixture.componentInstance.writeValue([
        { label: 'Apple', value: 'apple' },
        { label: 'Banana', value: 'banana' },
      ]);
      fixture.detectChanges();
      const received: (readonly SelectOption<string>[])[] = [];
      fixture.componentInstance.registerOnChange((value) => (received as SelectOption<string>[][]).push([...(value as SelectOption<string>[])]));

      (chips(fixture)[0].querySelector('button') as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(chips(fixture).map((c) => c.textContent?.trim())).toEqual(['Banana']);
      expect(received).toEqual([[{ label: 'Banana', value: 'banana' }]]);
    });

    it('typing while chips are already selected does not clear them (unlike single mode clearing the pick)', () => {
      const fixture = createMultiple();
      fixture.componentInstance.writeValue([{ label: 'Apple', value: 'apple' }]);
      fixture.detectChanges();

      typeText(fixture, 'ba');

      expect(chips(fixture).map((c) => c.textContent?.trim())).toEqual(['Apple']);
    });

    it('the clear button removes every selection at once', () => {
      const fixture = createMultiple();
      fixture.componentRef.setInput('showClear', true);
      fixture.componentInstance.writeValue([
        { label: 'Apple', value: 'apple' },
        { label: 'Banana', value: 'banana' },
      ]);
      fixture.detectChanges();
      const received: (readonly SelectOption<string>[])[] = [];
      fixture.componentInstance.registerOnChange((value) => (received as SelectOption<string>[][]).push([...(value as SelectOption<string>[])]));

      (fixture.nativeElement.querySelector('button[aria-label="Clear"]') as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(chips(fixture)).toHaveLength(0);
      expect(received).toEqual([[]]);
    });

    it('shows the placeholder only when no chips are selected', () => {
      const fixture = createMultiple();
      fixture.componentRef.setInput('placeholder', 'Pick fruits');
      fixture.detectChanges();
      expect(trigger(fixture).placeholder).toBe('Pick fruits');

      fixture.componentInstance.writeValue([{ label: 'Apple', value: 'apple' }]);
      fixture.detectChanges();
      expect(trigger(fixture).placeholder).toBe('');
    });

    it('single mode (default) is unaffected: no chips ever render, value stays a single option', () => {
      const fixture = createAutocomplete();
      fixture.componentInstance.writeValue({ label: 'Apple', value: 'apple' });
      fixture.detectChanges();

      expect(chips(fixture)).toHaveLength(0);
      expect(trigger(fixture).value).toBe('Apple');
    });
  });
});
