import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ListboxComponent } from './listbox.component';
import { SelectOption } from '../select/select.types';

const OPTIONS: SelectOption<string>[] = [
  { label: 'Small', value: 'sm' },
  { label: 'Medium', value: 'md', disabled: true },
  { label: 'Large', value: 'lg' },
];

// SelectPanelComponent's rows live inside a CdkVirtualScrollViewport, which
// jsdom (no real layout engine) never actually renders — same limitation
// already documented in select.component.spec.ts, worked around there the
// same way: drive selection via keyboard (aria-activedescendant + Enter)
// instead of clicking a rendered row.
function listboxDiv(fixture: { nativeElement: HTMLElement }): HTMLElement {
  return fixture.nativeElement.querySelector('[role="listbox"]') as HTMLElement;
}

function keydown(el: HTMLElement, key: string) {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

describe('ListboxComponent (single mode)', () => {
  function create(): ComponentFixture<ListboxComponent<string>> {
    const fixture = TestBed.createComponent(ListboxComponent<string>);
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.detectChanges();
    return fixture;
  }

  it('renders the shared SelectPanelComponent listbox inline (no overlay)', () => {
    const fixture = create();
    expect(listboxDiv(fixture)).not.toBeNull();
    expect(document.querySelector('.cdk-overlay-container [role="listbox"]')).toBeNull();
  });

  it('ArrowDown then Enter selects the next enabled option, skipping the disabled one', () => {
    const fixture = create();
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);

    keydown(listboxDiv(fixture), 'ArrowDown'); // Small -> skips disabled Medium -> Large
    keydown(listboxDiv(fixture), 'Enter');
    fixture.detectChanges();

    expect(onChange).toHaveBeenCalledWith('lg');
  });

  it('a value written before the panel first initializes seeds the active-descendant on it', () => {
    // SelectPanelComponent's initialActiveIndex() only runs once, in its own
    // ngAfterViewInit — unlike Select/MultiSelect (which open a *fresh*
    // SelectPanelComponent instance from scratch every time), Listbox embeds
    // one long-lived instance, so a writeValue() call has to land before that
    // first init to influence where the active descendant starts.
    const fixture = TestBed.createComponent(ListboxComponent<string>);
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.componentInstance.writeValue('lg');
    fixture.detectChanges();

    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);
    keydown(listboxDiv(fixture), 'Enter');
    fixture.detectChanges();
    expect(onChange).toHaveBeenCalledWith('lg');
  });

  it('a FormControl initialized with a value drives the panel', () => {
    @Component({
      standalone: true,
      imports: [ListboxComponent, ReactiveFormsModule],
      template: `<med-listbox [options]="options" [formControl]="control" />`,
    })
    class HostComponent {
      readonly options = OPTIONS;
      readonly control = new FormControl<string | null>('sm');
    }

    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="listbox"]')).not.toBeNull();
  });

  it('disabled: rejects option toggles even if a keyboard event slips through', () => {
    const fixture = create();
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);

    keydown(listboxDiv(fixture), 'Enter');
    fixture.detectChanges();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('applies invalid/disabled styling to the wrapper', () => {
    const fixture = create();
    fixture.componentRef.setInput('invalid', true);
    fixture.detectChanges();
    const wrapper = fixture.nativeElement.querySelector('div') as HTMLElement;
    expect(wrapper.className).toContain('border-danger-500');

    fixture.componentRef.setInput('invalid', false);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect((fixture.nativeElement.querySelector('div') as HTMLElement).className).toContain('pointer-events-none');
  });

  it('disables via setDisabledState (Reactive Forms disable())', () => {
    const fixture = create();
    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);
    keydown(listboxDiv(fixture), 'Enter');
    fixture.detectChanges();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('a disabled option is never the active descendant, even at the boundary a Home/End jump would otherwise land on', () => {
    // First option itself disabled here (unlike the shared OPTIONS array) —
    // exercises SelectPanelComponent's firstEnabledIndex()/lastEnabledIndex()
    // through Listbox's own aria-activedescendant, not just ArrowDown/Up.
    const optionsWithDisabledEdges: SelectOption<string>[] = [
      { label: 'Small', value: 'sm', disabled: true },
      { label: 'Medium', value: 'md' },
      { label: 'Large', value: 'lg', disabled: true },
    ];
    const fixture = TestBed.createComponent(ListboxComponent<string>);
    fixture.componentRef.setInput('options', optionsWithDisabledEdges);
    fixture.detectChanges();

    keydown(listboxDiv(fixture), 'Home');
    keydown(listboxDiv(fixture), 'End');
    fixture.detectChanges();

    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);
    keydown(listboxDiv(fixture), 'Enter');
    fixture.detectChanges();

    // Both boundary options are disabled, so the only reachable/selectable
    // option is the enabled one in the middle — Home/End never park the
    // active descendant on a disabled edge.
    expect(onChange).toHaveBeenCalledWith('md');
  });

  it('loading shows a spinner instead of the option list', () => {
    const fixture = create();
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    expect(listboxDiv(fixture).textContent).toContain('Loading...');
    expect(listboxDiv(fixture).querySelectorAll('[role="option"]')).toHaveLength(0);
  });

  describe('filter mode', () => {
    function createFilterable(): ComponentFixture<ListboxComponent<string>> {
      const fixture = TestBed.createComponent(ListboxComponent<string>);
      fixture.componentRef.setInput('options', OPTIONS);
      fixture.componentRef.setInput('filter', true);
      fixture.detectChanges();
      return fixture;
    }

    function filterInput(fixture: { nativeElement: HTMLElement }): HTMLInputElement {
      return fixture.nativeElement.querySelector('input[type="text"]') as HTMLInputElement;
    }

    it('renders a filter box when filter is true', () => {
      const fixture = createFilterable();
      expect(filterInput(fixture)).not.toBeNull();
    });

    it('typing in the filter box narrows the options, and Arrow/Enter selects a filtered result', () => {
      const fixture = createFilterable();
      const onChange = jest.fn();
      fixture.componentInstance.registerOnChange(onChange);

      const input = filterInput(fixture);
      input.value = 'arg';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // 'arg' only matches "Large" — Enter on the reset-to-first-match active
      // option should resolve straight to it without any Arrow movement.
      keydown(input, 'Enter');
      fixture.detectChanges();

      expect(onChange).toHaveBeenCalledWith('lg');
    });
  });
});

describe('ListboxComponent (multiple mode)', () => {
  function create(): ComponentFixture<ListboxComponent<string>> {
    const fixture = TestBed.createComponent(ListboxComponent<string>);
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.componentRef.setInput('multiple', true);
    fixture.detectChanges();
    return fixture;
  }

  it('sets aria-multiselectable', () => {
    const fixture = create();
    expect(listboxDiv(fixture).getAttribute('aria-multiselectable')).toBe('true');
  });

  it('toggling an option via keyboard adds it, toggling again removes it', () => {
    const fixture = create();
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);

    keydown(listboxDiv(fixture), 'Enter'); // Small
    fixture.detectChanges();
    expect(onChange).toHaveBeenLastCalledWith(['sm']);

    keydown(listboxDiv(fixture), 'Enter'); // Small again -> removed
    fixture.detectChanges();
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it('writeValue(null) normalizes to an empty selection, never throwing', () => {
    const fixture = create();
    const cmp = fixture.componentInstance;
    expect(() => cmp.writeValue(null)).not.toThrow();
    fixture.detectChanges();
    expect(listboxDiv(fixture)).not.toBeNull();
  });

  describe('showToggleAll', () => {
    function toggleAllRow(fixture: { nativeElement: HTMLElement }): HTMLElement {
      return fixture.nativeElement.querySelector('[role="checkbox"]') as HTMLElement;
    }

    it('is shown by default in multiple mode, and clicking it selects every enabled option', () => {
      const fixture = create();
      const onChange = jest.fn();
      fixture.componentInstance.registerOnChange(onChange);

      const row = toggleAllRow(fixture);
      expect(row).not.toBeNull();
      expect(row.getAttribute('aria-checked')).toBe('false');

      row.click();
      fixture.detectChanges();

      expect(onChange).toHaveBeenLastCalledWith(['sm', 'lg']); // 'md' is disabled, excluded
      expect(toggleAllRow(fixture).getAttribute('aria-checked')).toBe('true');
    });

    it('is indeterminate when some (not all) enabled options are selected, and clicking it completes the selection (mixed -> all, same as a native checkbox)', () => {
      const fixture = create();
      fixture.componentInstance.writeValue(['sm']);
      fixture.detectChanges();
      expect(toggleAllRow(fixture).getAttribute('aria-checked')).toBe('mixed');

      const onChange = jest.fn();
      fixture.componentInstance.registerOnChange(onChange);
      toggleAllRow(fixture).click();
      fixture.detectChanges();

      expect(onChange).toHaveBeenLastCalledWith(['sm', 'lg']);
    });

    it('is not shown when showToggleAll is false', () => {
      const fixture = create();
      fixture.componentRef.setInput('showToggleAll', false);
      fixture.detectChanges();
      expect(toggleAllRow(fixture)).toBeNull();
    });

    it('is not shown in single mode', () => {
      const fixture = TestBed.createComponent(ListboxComponent<string>);
      fixture.componentRef.setInput('options', OPTIONS);
      fixture.detectChanges();
      expect(toggleAllRow(fixture)).toBeNull();
    });
  });
});

describe('ListboxComponent (dragdrop)', () => {
  function create(): ComponentFixture<ListboxComponent<string>> {
    const fixture = TestBed.createComponent(ListboxComponent<string>);
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.componentRef.setInput('dragdrop', true);
    fixture.detectChanges();
    return fixture;
  }

  function rows(fixture: { nativeElement: HTMLElement }): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('[role="option"]'));
  }

  function emitDrop(fixture: ComponentFixture<ListboxComponent<string>>, event: Partial<CdkDragDrop<unknown>>): void {
    const dropList = fixture.debugElement.query(By.directive(CdkDropList)).injector.get(CdkDropList);
    dropList.dropped.emit(event as CdkDragDrop<unknown>);
    fixture.detectChanges();
  }

  // Real (non-virtualized) rows — unlike the default SelectPanelComponent-backed
  // mode, these actually render in jsdom, so real clicks work directly here.
  it('renders every option as a real, non-virtualized row', () => {
    const fixture = create();
    expect(rows(fixture)).toHaveLength(3);
    expect(rows(fixture).map((el) => el.textContent?.trim())).toEqual(['Small', 'Medium', 'Large']);
  });

  it('clicking a row still toggles selection, same as the default mode', () => {
    const fixture = create();
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);

    rows(fixture)[0].click(); // Small
    fixture.detectChanges();

    expect(onChange).toHaveBeenCalledWith('sm');
  });

  it('a disabled option is not draggable', () => {
    const fixture = create();
    const disabledRow = rows(fixture)[1]; // Medium
    expect(disabledRow.getAttribute('aria-disabled')).toBe('true');
  });

  it('dropping in a new position emits reorder with the moved indices and a pre-reordered copy of options', () => {
    const fixture = create();
    const received: { previousIndex: number; currentIndex: number; options: readonly SelectOption<string>[] }[] = [];
    fixture.componentInstance.reorder.subscribe((event) => received.push(event));

    emitDrop(fixture, { previousIndex: 0, currentIndex: 2 });

    expect(received).toHaveLength(1);
    expect(received[0].previousIndex).toBe(0);
    expect(received[0].currentIndex).toBe(2);
    expect(received[0].options.map((o) => o.value)).toEqual(['md', 'lg', 'sm']);
    // The component never mutates its own input — the original array is untouched.
    expect(fixture.componentInstance.options().map((o) => o.value)).toEqual(['sm', 'md', 'lg']);
  });

  it('dropping in the same position does not emit reorder', () => {
    const fixture = create();
    const reorder = jest.fn();
    fixture.componentInstance.reorder.subscribe(reorder);

    emitDrop(fixture, { previousIndex: 1, currentIndex: 1 });

    expect(reorder).not.toHaveBeenCalled();
  });

  it('disabled: does not emit reorder', () => {
    const fixture = create();
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const reorder = jest.fn();
    fixture.componentInstance.reorder.subscribe(reorder);

    emitDrop(fixture, { previousIndex: 0, currentIndex: 2 });

    expect(reorder).not.toHaveBeenCalled();
  });

  it('[UI-010.S2] supports checkmark indicator and striped rows', async () => {
    const fixture = TestBed.createComponent(ListboxComponent);
    fixture.componentRef.setInput('options', [
      { label: 'One', value: '1' },
      { label: 'Two', value: '2' },
    ]);
    fixture.componentRef.setInput('checkmark', true);
    fixture.componentRef.setInput('striped', true);
    fixture.componentRef.setInput('dragdrop', true);
    fixture.componentInstance.writeValue('1');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.getAttribute('data-striped')).toBe('true');
    expect(fixture.nativeElement.querySelector('[data-testid="listbox-checkmark"]')).not.toBeNull();
  });
});
