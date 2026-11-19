import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SelectComponent } from './select.component';
import { SelectOption } from './select.types';

const FRUITS: SelectOption<string>[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry', disabled: true },
];

function trigger(fixture: ComponentFixture<unknown>): HTMLElement {
  return fixture.nativeElement.querySelector('[role="combobox"]') as HTMLElement;
}

function listbox(): HTMLElement | null {
  return document.querySelector('[role="listbox"]');
}

// jsdom doesn't lay out `cdk-virtual-scroll-viewport` (no real client height to
// measure), so its rows never actually render in these tests — that path is
// covered directly in select-panel.component.spec.ts instead. Here, drive the
// open panel via keyboard, which only touches plain signal state.
function keydownOnPanel(fixture: ComponentFixture<unknown>, key: string) {
  listbox()!.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  fixture.detectChanges();
}

describe('SelectComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [OverlayModule] });
  });

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  function createSelect() {
    const fixture = TestBed.createComponent(SelectComponent<string>);
    fixture.componentRef.setInput('options', FRUITS);
    fixture.detectChanges();
    return fixture;
  }

  it('shows the placeholder when nothing is selected', () => {
    const fixture = createSelect();
    fixture.componentRef.setInput('placeholder', 'Pick a fruit');
    fixture.detectChanges();
    expect(trigger(fixture).textContent).toContain('Pick a fruit');
  });

  it('loading shows a spinner in the panel instead of the option list', () => {
    const fixture = createSelect();
    fixture.componentRef.setInput('loading', true);
    trigger(fixture).click();
    fixture.detectChanges();

    expect(listbox()!.textContent).toContain('Loading...');
    expect(listbox()!.querySelectorAll('[role="option"]')).toHaveLength(0);
  });

  it('opens the listbox panel on click, active on the first option', () => {
    const fixture = createSelect();
    trigger(fixture).click();
    fixture.detectChanges();

    expect(listbox()).not.toBeNull();
    expect(listbox()!.getAttribute('aria-activedescendant')).toMatch(/-option-0$/);
  });

  it('selecting an option (via keyboard) updates the value and closes the panel', () => {
    const fixture = createSelect();
    const received: (string | null)[] = [];
    fixture.componentInstance.registerOnChange((value: string | null) => received.push(value));

    trigger(fixture).click();
    fixture.detectChanges();
    keydownOnPanel(fixture, 'ArrowDown'); // apple -> banana
    keydownOnPanel(fixture, 'Enter');

    expect(received).toEqual(['banana']);
    expect(listbox()).toBeNull();
    expect(trigger(fixture).textContent).toContain('Banana');
  });

  it('skips the disabled option when navigating, and Escape closes without selecting', () => {
    const fixture = createSelect();
    const received: (string | null)[] = [];
    fixture.componentInstance.registerOnChange((value: string | null) => received.push(value));

    trigger(fixture).click();
    fixture.detectChanges();
    keydownOnPanel(fixture, 'End'); // last enabled option: banana (cherry is disabled)

    expect(listbox()!.getAttribute('aria-activedescendant')).toMatch(/-option-1$/);

    keydownOnPanel(fixture, 'Escape');
    expect(received).toEqual([]);
    expect(listbox()).toBeNull();
  });

  it('ArrowDown on the closed trigger opens the panel', () => {
    const fixture = createSelect();
    trigger(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(listbox()).not.toBeNull();
  });

  it('a disabled Select never opens on click', () => {
    const fixture = createSelect();
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    trigger(fixture).click();
    fixture.detectChanges();

    expect(listbox()).toBeNull();
    expect(trigger(fixture).getAttribute('aria-disabled')).toBe('true');
    expect(trigger(fixture).getAttribute('tabindex')).toBe('-1');
  });

  it('sets aria-invalid when invalid is true', () => {
    const fixture = createSelect();
    fixture.componentRef.setInput('invalid', true);
    fixture.detectChanges();

    expect(trigger(fixture).getAttribute('aria-invalid')).toBe('true');
  });

  it('writeValue(null) shows the placeholder, not a stray label', () => {
    const fixture = createSelect();
    const component = fixture.componentInstance;
    component.writeValue('banana');
    fixture.detectChanges();
    component.writeValue(null);
    fixture.detectChanges();

    expect(trigger(fixture).textContent).toContain('Select an option');
  });

  describe('showClear', () => {
    it('clears the value without reopening the panel', () => {
      const fixture = createSelect();
      fixture.componentRef.setInput('showClear', true);
      const received: (string | null)[] = [];
      fixture.componentInstance.registerOnChange((value: string | null) => received.push(value));
      fixture.componentInstance.writeValue('apple');
      fixture.detectChanges();

      const clearButton = fixture.nativeElement.querySelector('button[aria-label="Clear"]') as HTMLButtonElement;
      clearButton.click();
      fixture.detectChanges();

      expect(received).toEqual([null]);
      expect(listbox()).toBeNull();
      expect(trigger(fixture).textContent).toContain('Select an option');
    });

    it('is not shown when nothing is selected', () => {
      const fixture = createSelect();
      fixture.componentRef.setInput('showClear', true);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('button[aria-label="Clear"]')).toBeNull();
    });

    // Regression: the clear button is a normal-flow flex item of the trigger
    // row (not absolutely positioned like DatePicker/Autocomplete's), so an
    // icon-only <button> without its own inline-flex centering picks up the
    // inherited line-height as a "strut" taller than the icon itself, growing
    // the whole trigger's height the moment a value is selected.
    it('does not grow the trigger height when the clear button appears', () => {
      const fixture = createSelect();
      fixture.componentRef.setInput('showClear', true);
      fixture.componentInstance.writeValue('apple');
      fixture.detectChanges();
      const clearButton = trigger(fixture).querySelector('button[aria-label="Clear"]') as HTMLButtonElement;
      expect(clearButton.className).toContain('inline-flex');
      expect(clearButton.className).toContain('items-center');
      expect(clearButton.className).toContain('justify-center');
    });
  });

  describe('editable', () => {
    function editableInput(fixture: ComponentFixture<unknown>): HTMLInputElement {
      return trigger(fixture) as HTMLInputElement;
    }

    it('renders a real, always-typeable <input> instead of the role="combobox" div', () => {
      const fixture = createSelect();
      fixture.componentRef.setInput('editable', true);
      fixture.detectChanges();
      expect(editableInput(fixture).tagName).toBe('INPUT');
      expect(editableInput(fixture).getAttribute('role')).toBe('combobox');
    });

    it('typing commits the raw text live as the value, on every keystroke', () => {
      const fixture = createSelect();
      fixture.componentRef.setInput('editable', true);
      fixture.detectChanges();
      const received: (string | null)[] = [];
      fixture.componentInstance.registerOnChange((value: string | null) => received.push(value));

      const input = editableInput(fixture);
      input.value = 'Dragonfruit'; // not one of FRUITS
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(received).toEqual(['Dragonfruit']);
      expect(input.value).toBe('Dragonfruit');
    });

    it('clearing the field commits null, not an empty string', () => {
      const fixture = createSelect();
      fixture.componentRef.setInput('editable', true);
      fixture.detectChanges();
      const received: (string | null)[] = [];
      fixture.componentInstance.registerOnChange((value: string | null) => received.push(value));

      const input = editableInput(fixture);
      input.value = '';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(received).toEqual([null]);
    });

    it('picking a real option from the panel still shows its label, taking priority over any previously typed text', () => {
      const fixture = createSelect();
      fixture.componentRef.setInput('editable', true);
      fixture.detectChanges();

      const input = editableInput(fixture);
      input.value = 'ban';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      fixture.componentInstance.writeValue('banana'); // simulates picking the real option
      fixture.detectChanges();

      expect(input.value).toBe('Banana');
    });

    it('ArrowDown opens the panel; Space types a literal space instead of opening', () => {
      const fixture = createSelect();
      fixture.componentRef.setInput('editable', true);
      fixture.detectChanges();

      const input = editableInput(fixture);
      input.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));
      fixture.detectChanges();
      expect(listbox()).toBeNull();

      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
      fixture.detectChanges();
      expect(listbox()).not.toBeNull();
    });

    it('clicking the field opens the panel, same as the non-editable trigger', () => {
      const fixture = createSelect();
      fixture.componentRef.setInput('editable', true);
      fixture.detectChanges();

      editableInput(fixture).dispatchEvent(new MouseEvent('click', { bubbles: true }));
      fixture.detectChanges();

      expect(listbox()).not.toBeNull();
    });

    it('typing a non-empty value opens the panel, without reopening it on every further keystroke', () => {
      const fixture = createSelect();
      fixture.componentRef.setInput('editable', true);
      fixture.detectChanges();
      const input = editableInput(fixture);

      input.value = 'b';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(listbox()).not.toBeNull();
      const firstListbox = listbox();

      input.value = 'ba';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(listbox()).toBe(firstListbox); // same panel instance, not closed and reopened
    });

    it('does not open the panel when the field is cleared back to empty', () => {
      const fixture = createSelect();
      fixture.componentRef.setInput('editable', true);
      fixture.detectChanges();
      const input = editableInput(fixture);

      input.value = '';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(listbox()).toBeNull();
    });

    it('forwards keyboard events on the input to the open panel, so Arrow/Enter can still pick a real option while the input stays focused', () => {
      const fixture = createSelect();
      fixture.componentRef.setInput('editable', true);
      fixture.detectChanges();
      const received: (string | null)[] = [];
      fixture.componentInstance.registerOnChange((value: string | null) => received.push(value));

      const input = editableInput(fixture);
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })); // opens, active -> apple
      fixture.detectChanges();
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })); // -> banana
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
      fixture.detectChanges();

      expect(received).toEqual(['banana']);
      expect(input.value).toBe('Banana');
      expect(listbox()).toBeNull(); // picking a real option still closes, same as the non-editable trigger
    });

    it('typing highlights the first matching option (case-insensitive prefix), without filtering the list', () => {
      const fixture = createSelect();
      fixture.componentRef.setInput('editable', true);
      fixture.detectChanges();
      const input = editableInput(fixture);

      input.value = 'b'; // matches "Banana" only, opens on this same keystroke
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(listbox()!.getAttribute('aria-activedescendant')).toMatch(/-option-1$/); // banana

      input.value = 'ba'; // still matches, panel already open — live update path
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(listbox()!.getAttribute('aria-activedescendant')).toMatch(/-option-1$/);
    });

    it('never highlights a disabled option even if its label matches', () => {
      const fixture = createSelect();
      fixture.componentRef.setInput('editable', true);
      fixture.detectChanges();
      const input = editableInput(fixture);

      input.value = 'c'; // only matches "Cherry", which is disabled
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(listbox()!.getAttribute('aria-activedescendant')).not.toMatch(/-option-2$/);
    });

    it('leaves the highlight unchanged when nothing matches the typed text', () => {
      const fixture = createSelect();
      fixture.componentRef.setInput('editable', true);
      fixture.detectChanges();
      const input = editableInput(fixture);

      input.value = 'b';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      const activeAfterMatch = listbox()!.getAttribute('aria-activedescendant');

      input.value = 'bxyz'; // no option matches this prefix
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(listbox()!.getAttribute('aria-activedescendant')).toBe(activeAfterMatch);
    });

    it('blurring the field closes the panel — it never actually took focus in this mode', () => {
      const fixture = createSelect();
      fixture.componentRef.setInput('editable', true);
      fixture.detectChanges();
      const input = editableInput(fixture);

      input.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      fixture.detectChanges();
      expect(listbox()).not.toBeNull();

      input.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
      fixture.detectChanges();
      expect(listbox()).toBeNull();
    });

    it('is a real disabled <input>, unlike the non-editable trigger\'s aria-disabled', () => {
      const fixture = createSelect();
      fixture.componentRef.setInput('editable', true);
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      expect(editableInput(fixture).disabled).toBe(true);
    });

    it('showClear renders next to a typed value and clears it back to null', () => {
      const fixture = createSelect();
      fixture.componentRef.setInput('editable', true);
      fixture.componentRef.setInput('showClear', true);
      fixture.detectChanges();
      const received: (string | null)[] = [];
      fixture.componentInstance.registerOnChange((value: string | null) => received.push(value));

      const input = editableInput(fixture);
      input.value = 'Dragonfruit';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const clearButton = fixture.nativeElement.querySelector('button[aria-label="Clear"]') as HTMLButtonElement;
      expect(clearButton).not.toBeNull();
      clearButton.click();
      fixture.detectChanges();

      expect(received).toEqual(['Dragonfruit', null]);
      expect(input.value).toBe('');
    });
  });

  describe('lazy', () => {
    it('pushes options() updates into the already-open panel, so newly-loaded items are keyboard-navigable', () => {
      const fixture = createSelect();
      fixture.componentRef.setInput('lazy', true);
      trigger(fixture).click();
      fixture.detectChanges();

      // Consumer appends a freshly "loaded" option while the panel is open.
      fixture.componentRef.setInput('options', [...FRUITS, { label: 'Durian', value: 'durian' }]);
      fixture.detectChanges();

      keydownOnPanel(fixture, 'End');
      expect(listbox()!.getAttribute('aria-activedescendant')).toMatch(/-option-3$/); // durian, the newly-added 4th option
    });

    it('without lazy, options() changes are not reflected in an already-open panel (snapshot at open time)', () => {
      const fixture = createSelect();
      trigger(fixture).click();
      fixture.detectChanges();

      fixture.componentRef.setInput('options', [...FRUITS, { label: 'Durian', value: 'durian' }]);
      fixture.detectChanges();

      keydownOnPanel(fixture, 'End');
      expect(listbox()!.getAttribute('aria-activedescendant')).toMatch(/-option-1$/); // banana — last enabled among the stale 3-item snapshot (cherry disabled)
    });
  });

  it('setDisabledState(true) (Reactive Forms disable()) prevents opening', () => {
    const fixture = createSelect();
    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();

    trigger(fixture).click();
    fixture.detectChanges();

    expect(listbox()).toBeNull();
  });

  it('a FormControl seeded with a value renders that option label on init (real-world regression scenario)', () => {
    @Component({
      standalone: true,
      imports: [SelectComponent, ReactiveFormsModule],
      template: `<med-select [options]="options" [formControl]="control" />`,
    })
    class HostComponent {
      readonly options = FRUITS;
      readonly control = new FormControl('banana', { nonNullable: true });
    }

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(trigger(fixture).textContent).toContain('Banana');
  });

  it('destroying the component while the panel is open closes the overlay', () => {
    const fixture = createSelect();
    trigger(fixture).click();
    fixture.detectChanges();
    expect(listbox()).not.toBeNull();

    fixture.destroy();

    expect(listbox()).toBeNull();
  });
});
