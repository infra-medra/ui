import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MultiSelectComponent } from './multi-select.component';
import { SelectOption } from '../select/select.types';

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

// jsdom doesn't lay out `cdk-virtual-scroll-viewport`, so its rows never
// actually render here — covered directly in select-panel.component.spec.ts.
// Drive the open panel via keyboard instead.
function keydownOnPanel(fixture: ComponentFixture<unknown>, key: string) {
  listbox()!.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  fixture.detectChanges();
}

describe('MultiSelectComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [OverlayModule] });
  });

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  function createMultiSelect() {
    const fixture = TestBed.createComponent(MultiSelectComponent<string>);
    fixture.componentRef.setInput('options', FRUITS);
    fixture.detectChanges();
    return fixture;
  }

  it('loading shows a spinner in the panel instead of the option list', () => {
    const fixture = createMultiSelect();
    fixture.componentRef.setInput('loading', true);
    trigger(fixture).click();
    fixture.detectChanges();

    expect(listbox()!.textContent).toContain('Loading...');
    expect(listbox()!.querySelectorAll('[role="option"]')).toHaveLength(0);
  });

  it('shows the placeholder when nothing is selected', () => {
    const fixture = createMultiSelect();
    fixture.componentRef.setInput('placeholder', 'Pick fruits');
    fixture.detectChanges();
    expect(trigger(fixture).textContent).toContain('Pick fruits');
  });

  it('picking options keeps the panel open and joins up to 2 labels with a comma', () => {
    const fixture = createMultiSelect();
    const received: (readonly string[])[] = [];
    fixture.componentInstance.registerOnChange((value: readonly string[]) => received.push(value));

    trigger(fixture).click();
    fixture.detectChanges();
    keydownOnPanel(fixture, 'Enter'); // apple
    expect(listbox()).not.toBeNull();
    keydownOnPanel(fixture, 'ArrowDown');
    keydownOnPanel(fixture, 'Enter'); // banana

    expect(received).toEqual([['apple'], ['apple', 'banana']]);
    expect(listbox()).not.toBeNull();
    expect(trigger(fixture).textContent).toContain('Apple, Banana');
  });

  it('picking the same option again removes it (toggle)', () => {
    const fixture = createMultiSelect();
    const received: (readonly string[])[] = [];
    fixture.componentInstance.registerOnChange((value: readonly string[]) => received.push(value));

    trigger(fixture).click();
    fixture.detectChanges();
    keydownOnPanel(fixture, 'Enter'); // apple: add
    keydownOnPanel(fixture, 'Enter'); // apple: remove

    expect(received).toEqual([['apple'], []]);
  });

  it('collapses the trigger summary to "N selected" for 3+ picks', () => {
    const manyOptions: SelectOption<string>[] = [
      { label: 'One', value: '1' },
      { label: 'Two', value: '2' },
      { label: 'Three', value: '3' },
    ];
    const fixture = TestBed.createComponent(MultiSelectComponent<string>);
    fixture.componentRef.setInput('options', manyOptions);
    fixture.detectChanges();

    trigger(fixture).click();
    fixture.detectChanges();
    keydownOnPanel(fixture, 'Enter');
    keydownOnPanel(fixture, 'ArrowDown');
    keydownOnPanel(fixture, 'Enter');
    keydownOnPanel(fixture, 'ArrowDown');
    keydownOnPanel(fixture, 'Enter');

    expect(trigger(fixture).textContent).toContain('3 selected');
  });

  it('Escape closes the panel without discarding already-picked values', () => {
    const fixture = createMultiSelect();
    trigger(fixture).click();
    fixture.detectChanges();
    keydownOnPanel(fixture, 'Enter'); // apple
    keydownOnPanel(fixture, 'Escape');

    expect(listbox()).toBeNull();
    expect(trigger(fixture).textContent).toContain('Apple');
  });

  it('never toggles a disabled option', () => {
    const fixture = createMultiSelect();
    const received: (readonly string[])[] = [];
    fixture.componentInstance.registerOnChange((value: readonly string[]) => received.push(value));

    trigger(fixture).click();
    fixture.detectChanges();
    keydownOnPanel(fixture, 'ArrowUp'); // wraps from apple to the last enabled option: banana (cherry skipped)
    keydownOnPanel(fixture, 'Enter');

    expect(received).toEqual([['banana']]);
  });

  describe('showClear', () => {
    it('clears the whole selection without reopening the panel', () => {
      const fixture = createMultiSelect();
      fixture.componentRef.setInput('showClear', true);
      const received: (readonly string[])[] = [];
      fixture.componentInstance.registerOnChange((value: readonly string[]) => received.push(value));
      fixture.componentInstance.writeValue(['apple', 'banana']);
      fixture.detectChanges();

      const clearButton = fixture.nativeElement.querySelector('button[aria-label="Clear"]') as HTMLButtonElement;
      clearButton.click();
      fixture.detectChanges();

      expect(received).toEqual([[]]);
      expect(listbox()).toBeNull();
      expect(trigger(fixture).textContent).toContain('Select options');
    });

    it('is not shown when nothing is selected', () => {
      const fixture = createMultiSelect();
      fixture.componentRef.setInput('showClear', true);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('button[aria-label="Clear"]')).toBeNull();
    });
  });

  describe('showToggleAll', () => {
    function toggleAllRow(): HTMLElement | null {
      return document.querySelector('[role="checkbox"]');
    }

    it('is shown by default, and clicking it selects every enabled option and stays open', () => {
      const fixture = createMultiSelect();
      const received: (readonly string[])[] = [];
      fixture.componentInstance.registerOnChange((value: readonly string[]) => received.push(value));

      trigger(fixture).click();
      fixture.detectChanges();
      const row = toggleAllRow();
      expect(row).not.toBeNull();

      row!.click();
      fixture.detectChanges();

      expect(received).toEqual([['apple', 'banana']]); // 'cherry' is disabled, excluded
      expect(listbox()).not.toBeNull(); // stays open, same as toggling a single option
    });

    it('is not shown when showToggleAll is false', () => {
      const fixture = createMultiSelect();
      fixture.componentRef.setInput('showToggleAll', false);
      trigger(fixture).click();
      fixture.detectChanges();
      expect(toggleAllRow()).toBeNull();
    });
  });

  describe('selectionLimit', () => {
    it('once reached, keyboard nav only lands on already-selected options (not-yet-selected ones become unreachable)', () => {
      const fixture = createMultiSelect();
      fixture.componentRef.setInput('selectionLimit', 1);
      fixture.componentInstance.writeValue(['apple']);
      trigger(fixture).click();
      fixture.detectChanges();

      expect(listbox()!.getAttribute('aria-activedescendant')).toMatch(/-option-0$/); // apple, already selected

      keydownOnPanel(fixture, 'ArrowDown'); // banana is disabled by the cap, cherry is disabled outright — wraps back to apple
      expect(listbox()!.getAttribute('aria-activedescendant')).toMatch(/-option-0$/);
    });

    it('hides showToggleAll, even when showToggleAll is explicitly true', () => {
      const fixture = createMultiSelect();
      fixture.componentRef.setInput('showToggleAll', true);
      fixture.componentRef.setInput('selectionLimit', 1);
      trigger(fixture).click();
      fixture.detectChanges();
      expect(document.querySelector('[role="checkbox"]')).toBeNull();
    });
  });

  it('writeValue(null) and writeValue(undefined) both normalize to an empty selection', () => {
    const fixture = createMultiSelect();
    const component = fixture.componentInstance;

    expect(() => component.writeValue(null)).not.toThrow();
    fixture.detectChanges();
    expect(trigger(fixture).textContent).toContain('Select options');

    expect(() => component.writeValue(undefined)).not.toThrow();
    fixture.detectChanges();
    expect(trigger(fixture).textContent).toContain('Select options');
  });

  it('a disabled MultiSelect never opens on click', () => {
    const fixture = createMultiSelect();
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    trigger(fixture).click();
    fixture.detectChanges();

    expect(listbox()).toBeNull();
    expect(trigger(fixture).getAttribute('aria-disabled')).toBe('true');
  });

  it('a FormControl seeded with values renders the joined summary on init (real-world regression scenario)', () => {
    @Component({
      standalone: true,
      imports: [MultiSelectComponent, ReactiveFormsModule],
      template: `<med-multi-select [options]="options" [formControl]="control" />`,
    })
    class HostComponent {
      readonly options = FRUITS;
      readonly control = new FormControl<string[]>(['apple', 'banana'], { nonNullable: true });
    }

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(trigger(fixture).textContent).toContain('Apple, Banana');
  });

  it('destroying the component while the panel is open closes the overlay', () => {
    const fixture = createMultiSelect();
    trigger(fixture).click();
    fixture.detectChanges();
    expect(listbox()).not.toBeNull();

    fixture.destroy();

    expect(listbox()).toBeNull();
  });

  describe('display="chip"', () => {
    function createChipMultiSelect() {
      const fixture = createMultiSelect();
      fixture.componentRef.setInput('display', 'chip');
      fixture.componentInstance.writeValue(['apple', 'banana']);
      fixture.detectChanges();
      return fixture;
    }

    function chips(fixture: ComponentFixture<unknown>): HTMLElement[] {
      return Array.from(trigger(fixture).querySelectorAll('med-chip'));
    }

    it('renders one removable chip per selection instead of the joined-labels summary', () => {
      const fixture = createChipMultiSelect();
      expect(chips(fixture).map((c) => c.textContent?.trim())).toEqual(['Apple', 'Banana']);
      expect(trigger(fixture).textContent).not.toContain('Apple, Banana');
    });

    it('falls back to the placeholder when nothing is selected, same as comma mode', () => {
      const fixture = createMultiSelect();
      fixture.componentRef.setInput('display', 'chip');
      fixture.detectChanges();

      expect(chips(fixture)).toHaveLength(0);
      expect(trigger(fixture).textContent).toContain('Select options');
    });

    it("clicking a chip's remove button removes just that selection and calls onChange, without opening the dropdown", () => {
      const fixture = createChipMultiSelect();
      const received: (readonly string[])[] = [];
      fixture.componentInstance.registerOnChange((value: readonly string[]) => (received as string[][]).push([...value]));

      (chips(fixture)[0].querySelector('button') as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(chips(fixture).map((c) => c.textContent?.trim())).toEqual(['Banana']);
      expect(received).toEqual([['banana']]);
      expect(listbox()).toBeNull(); // dropdown never opened
    });

    it("clicking a chip's own label (not the remove button) still opens the dropdown, same as clicking anywhere else on the trigger", () => {
      const fixture = createChipMultiSelect();
      (chips(fixture)[0].querySelector('span.truncate') as HTMLElement).click();
      fixture.detectChanges();

      expect(listbox()).not.toBeNull();
    });

    it('defaults the remove label to "Remove {label}", customizable via removeChipLabelTemplate', () => {
      const fixture = createChipMultiSelect();
      expect(chips(fixture)[0].querySelector('button')!.getAttribute('aria-label')).toBe('Remove Apple');

      fixture.componentRef.setInput('removeChipLabelTemplate', (label: string) => `Tirar ${label}`);
      fixture.detectChanges();
      expect(chips(fixture)[0].querySelector('button')!.getAttribute('aria-label')).toBe('Tirar Apple');
    });

    it('the comma summary (default display) is unaffected when display is left unset', () => {
      const fixture = createMultiSelect();
      fixture.componentInstance.writeValue(['apple', 'banana']);
      fixture.detectChanges();

      expect(chips(fixture)).toHaveLength(0);
      expect(trigger(fixture).textContent).toContain('Apple, Banana');
    });
  });

  it('[UI-010.S2] formats maxSelectedLabels summary and marks virtualScroll', () => {
    const fixture = TestBed.createComponent(MultiSelectComponent);
    fixture.componentRef.setInput('options', [
      { label: 'Apple', value: 'apple' },
      { label: 'Banana', value: 'banana' },
      { label: 'Cherry', value: 'cherry' },
    ]);
    fixture.componentRef.setInput('maxSelectedLabels', 2);
    fixture.componentRef.setInput('selectedItemsLabel', '{0} items selected');
    fixture.componentRef.setInput('virtualScroll', true);
    fixture.componentInstance.writeValue(['apple', 'banana', 'cherry']);
    fixture.detectChanges();

    expect(trigger(fixture).textContent).toContain('3 items selected');
    expect(fixture.nativeElement.getAttribute('data-virtual-scroll')).toBe('true');
  });
});
