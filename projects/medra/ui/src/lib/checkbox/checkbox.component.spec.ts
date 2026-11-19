import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CheckboxComponent } from './checkbox.component';

function nativeInput(fixture: { nativeElement: HTMLElement }): HTMLInputElement {
  return fixture.nativeElement.querySelector('input[type="checkbox"]') as HTMLInputElement;
}

function toggle(input: HTMLInputElement, checked: boolean) {
  input.checked = checked;
  input.dispatchEvent(new Event('change'));
}

describe('CheckboxComponent', () => {
  function createCheckbox() {
    const fixture = TestBed.createComponent(CheckboxComponent);
    fixture.detectChanges();
    return { fixture, input: nativeInput(fixture) };
  }

  it('renders unchecked by default with no check icon', () => {
    const { fixture, input } = createCheckbox();

    expect(input.checked).toBe(false);
    expect(fixture.nativeElement.querySelector('med-icon')).toBeNull();
  });

  it('toggling the native input updates state and shows the check icon', () => {
    const { fixture, input } = createCheckbox();

    toggle(input, true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('med-icon[name="check"]')).not.toBeNull();
  });

  describe('binary false handling (regression)', () => {
    it('writeValue(false) renders unchecked with a real boolean false, not undefined/unset', () => {
      const { fixture, input } = createCheckbox();
      const checkbox = fixture.componentInstance;

      checkbox.writeValue(true);
      fixture.detectChanges();
      checkbox.writeValue(false);
      fixture.detectChanges();

      expect(input.checked).toBe(false);
      expect(fixture.nativeElement.querySelector('med-icon')).toBeNull();
    });

    it('writeValue(null) and writeValue(undefined) both normalize to false, never throwing', () => {
      const { fixture, input } = createCheckbox();
      const checkbox = fixture.componentInstance;

      expect(() => checkbox.writeValue(null)).not.toThrow();
      fixture.detectChanges();
      expect(input.checked).toBe(false);

      expect(() => checkbox.writeValue(undefined as unknown as boolean)).not.toThrow();
      fixture.detectChanges();
      expect(input.checked).toBe(false);
    });

    it('unchecking emits a real false through registerOnChange, not undefined', () => {
      const { fixture, input } = createCheckbox();
      const checkbox = fixture.componentInstance;
      const received: (boolean | undefined)[] = [];
      checkbox.registerOnChange((value) => received.push(value as boolean | undefined));

      checkbox.writeValue(true);
      fixture.detectChanges();
      toggle(input, false);

      expect(received).toEqual([false]);
      expect(received[0]).not.toBeUndefined();
    });

    it('a FormControl initialized with false renders unchecked (real-world regression scenario)', () => {
      @Component({
        standalone: true,
        imports: [CheckboxComponent, ReactiveFormsModule],
        template: `<med-checkbox [formControl]="control" />`,
      })
      class HostComponent {
        readonly control = new FormControl(false, { nonNullable: true });
      }

      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();

      expect(nativeInput(fixture).checked).toBe(false);
      expect(fixture.nativeElement.querySelector('med-icon')).toBeNull();
    });
  });

  it('shows the minus icon (not check) when indeterminate, and sets the native indeterminate property', () => {
    const { fixture, input } = createCheckbox();
    fixture.componentRef.setInput('indeterminate', true);
    fixture.detectChanges();

    expect(input.indeterminate).toBe(true);
    expect(fixture.nativeElement.querySelector('med-icon[name="minus"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('med-icon[name="check"]')).toBeNull();
  });

  it('disables the native input via the disabled input', () => {
    const fixture = TestBed.createComponent(CheckboxComponent);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    expect(nativeInput(fixture).disabled).toBe(true);
  });

  it('disables the native input via setDisabledState (Reactive Forms disable())', () => {
    const { fixture, input } = createCheckbox();
    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();

    expect(input.disabled).toBe(true);
  });

  it('sets aria-invalid when invalid is true', () => {
    const fixture = TestBed.createComponent(CheckboxComponent);
    fixture.componentRef.setInput('invalid', true);
    fixture.detectChanges();

    expect(nativeInput(fixture).getAttribute('aria-invalid')).toBe('true');
  });

  it('is a real native <input type="checkbox">, so Space-key activation is entirely native — the same DOM activation behavior a Space keypress triggers (toggling checked and firing change/click) works end-to-end with no directive-level keydown handling (Wave 2 keyboard-coverage fix)', () => {
    const { fixture, input } = createCheckbox();
    expect(input.type).toBe('checkbox');
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);

    input.click(); // jsdom's real activation behavior for a checkbox — the same one a focused Space keypress triggers in a real browser
    fixture.detectChanges();

    expect(input.checked).toBe(true);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(fixture.nativeElement.querySelector('med-icon[name="check"]')).not.toBeNull();
  });

  it.each([
    ['sm', 'size-4'],
    ['default', 'size-5'],
    ['lg', 'size-6'],
  ] as const)('applies the box size class for size=%s', (size, expectedClass) => {
    const fixture = TestBed.createComponent(CheckboxComponent);
    fixture.componentRef.setInput('size', size);
    fixture.detectChanges();

    const box = fixture.nativeElement.querySelector('span[aria-hidden="true"]') as HTMLElement;
    expect(box.className).toContain(expectedClass);
  });

  it('merges a consumer class override onto the decorative box', () => {
    const fixture = TestBed.createComponent(CheckboxComponent);
    fixture.componentRef.setInput('class', 'rounded-full');
    fixture.detectChanges();

    const box = fixture.nativeElement.querySelector('span[aria-hidden="true"]') as HTMLElement;
    expect(box.className).toContain('rounded-full');
    expect(box.className).not.toContain('rounded-sm');
  });

  it('applies the inputId to the native input for external label pairing', () => {
    const fixture = TestBed.createComponent(CheckboxComponent);
    fixture.componentRef.setInput('inputId', 'accept-terms');
    fixture.detectChanges();

    expect(nativeInput(fixture).id).toBe('accept-terms');
  });

  describe('trueValue/falseValue', () => {
    function createCustom() {
      const fixture = TestBed.createComponent(CheckboxComponent);
      fixture.componentRef.setInput('trueValue', 'yes');
      fixture.componentRef.setInput('falseValue', 'no');
      fixture.detectChanges();
      return { fixture, input: nativeInput(fixture) };
    }

    it('writeValue(trueValue) renders checked', () => {
      const { fixture, input } = createCustom();
      fixture.componentInstance.writeValue('yes');
      fixture.detectChanges();
      expect(input.checked).toBe(true);
    });

    it('writeValue(falseValue) and writeValue(null) both render unchecked', () => {
      const { fixture, input } = createCustom();
      fixture.componentInstance.writeValue('no');
      fixture.detectChanges();
      expect(input.checked).toBe(false);

      fixture.componentInstance.writeValue(null);
      fixture.detectChanges();
      expect(input.checked).toBe(false);
    });

    it('toggling emits trueValue/falseValue instead of a raw boolean', () => {
      const { fixture, input } = createCustom();
      const received: unknown[] = [];
      fixture.componentInstance.registerOnChange((value) => received.push(value as boolean | undefined));

      toggle(input, true);
      toggle(input, false);

      expect(received).toEqual(['yes', 'no']);
    });

    it('defaults to plain true/false when trueValue/falseValue are not set', () => {
      const { fixture, input } = createCheckbox();
      const received: unknown[] = [];
      fixture.componentInstance.registerOnChange((value) => received.push(value as boolean | undefined));

      toggle(input, true);

      expect(received).toEqual([true]);
    });
  });

  describe('group-by-array mode (value set)', () => {
    function createGrouped(value: string) {
      const fixture = TestBed.createComponent(CheckboxComponent);
      fixture.componentRef.setInput('value', value);
      fixture.detectChanges();
      return { fixture, input: nativeInput(fixture) };
    }

    it('checked reflects membership in the bound array, not a boolean', () => {
      const { fixture, input } = createGrouped('sf');
      fixture.componentInstance.writeValue(['sf', 'nyc']);
      fixture.detectChanges();
      expect(input.checked).toBe(true);

      fixture.componentInstance.writeValue(['nyc']);
      fixture.detectChanges();
      expect(input.checked).toBe(false);
    });

    it('writeValue(null)/writeValue(undefined) normalize to an empty array, never throwing', () => {
      const { fixture, input } = createGrouped('sf');
      expect(() => fixture.componentInstance.writeValue(null)).not.toThrow();
      fixture.detectChanges();
      expect(input.checked).toBe(false);
    });

    it('checking adds this value to the array, leaving the rest untouched', () => {
      const { fixture, input } = createGrouped('sf');
      const received: unknown[] = [];
      fixture.componentInstance.registerOnChange((value) => received.push(value as boolean | undefined));
      fixture.componentInstance.writeValue(['nyc']);
      fixture.detectChanges();

      toggle(input, true);

      expect(received).toEqual([['nyc', 'sf']]);
    });

    it('unchecking removes only this value from the array', () => {
      const { fixture, input } = createGrouped('sf');
      const received: unknown[] = [];
      fixture.componentInstance.registerOnChange((value) => received.push(value as boolean | undefined));
      fixture.componentInstance.writeValue(['nyc', 'sf']);
      fixture.detectChanges();

      toggle(input, false);

      expect(received).toEqual([['nyc']]);
    });

    it('trueValue/falseValue are ignored in group mode', () => {
      const fixture = TestBed.createComponent(CheckboxComponent);
      fixture.componentRef.setInput('value', 'sf');
      fixture.componentRef.setInput('trueValue', 'yes');
      fixture.componentRef.setInput('falseValue', 'no');
      fixture.componentInstance.writeValue(['sf']);
      fixture.detectChanges();

      expect(nativeInput(fixture).checked).toBe(true);
    });
  });

  describe('readonly', () => {
    it('is focusable and not visually disabled, unlike disabled', () => {
      const fixture = TestBed.createComponent(CheckboxComponent);
      fixture.componentRef.setInput('readonly', true);
      fixture.detectChanges();

      const input = nativeInput(fixture);
      expect(input.disabled).toBe(false);
      expect(input.getAttribute('aria-readonly')).toBe('true');
    });

    it('never toggles from a native change event, and reverts the DOM checkbox back', () => {
      const fixture = TestBed.createComponent(CheckboxComponent);
      fixture.componentRef.setInput('readonly', true);
      fixture.detectChanges();
      const input = nativeInput(fixture);
      const onChange = jest.fn();
      fixture.componentInstance.registerOnChange(onChange);

      toggle(input, true);
      fixture.detectChanges();

      expect(onChange).not.toHaveBeenCalled();
      expect(input.checked).toBe(false);
    });

    it('a readonly + already-checked box reverts back to checked if toggled', () => {
      const fixture = TestBed.createComponent(CheckboxComponent);
      fixture.componentRef.setInput('readonly', true);
      fixture.componentInstance.writeValue(true);
      fixture.detectChanges();
      const input = nativeInput(fixture);

      toggle(input, false);
      fixture.detectChanges();

      expect(input.checked).toBe(true);
    });
  });

  it('[UI-010.S1] supports variant="filled" and binary=false array mode', () => {
    const fixture = TestBed.createComponent(CheckboxComponent);
    fixture.componentRef.setInput('variant', 'filled');
    fixture.componentRef.setInput('binary', false);
    fixture.componentRef.setInput('value', 'alpha');
    fixture.detectChanges();

    expect(fixture.nativeElement.getAttribute('data-variant')).toBe('filled');
    const emitted: unknown[] = [];
    fixture.componentInstance.registerOnChange((v) => emitted.push(v));

    const input = fixture.nativeElement.querySelector('input[type="checkbox"]') as HTMLInputElement;
    toggle(input, true);
    fixture.detectChanges();
    expect(emitted).toEqual([['alpha']]);
  });
});
