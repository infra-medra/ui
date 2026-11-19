import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputTextDirective } from './input-text.directive';

function typeInto(input: HTMLInputElement, value: string) {
  input.value = value;
  input.dispatchEvent(new Event('input'));
}

describe('InputTextDirective', () => {
  @Component({
    standalone: true,
    imports: [InputTextDirective],
    template: `<input medInputText type="text" [size]="size" [invalid]="invalid" [class]="extraClass" />`,
  })
  class HostComponent {
    size: 'sm' | 'default' | 'lg' = 'default';
    invalid = false;
    extraClass = '';
  }

  function createHost(overrides: Partial<HostComponent> = {}) {
    const fixture = TestBed.createComponent(HostComponent);
    Object.assign(fixture.componentInstance, overrides);
    fixture.detectChanges();
    return { fixture, input: fixture.nativeElement.querySelector('input') as HTMLInputElement };
  }

  it('applies the default-size field classes', () => {
    const { input } = createHost();

    expect(input.className).toContain('px-(--spacing-field-x)');
    expect(input.getAttribute('aria-invalid')).toBeNull();
  });

  it('reacts to size changes', () => {
    const { input } = createHost({ size: 'lg' });

    expect(input.className).toContain('px-(--spacing-field-lg-x)');
  });

  it('sets border/ring color and aria-invalid when invalid', () => {
    const { input } = createHost({ invalid: true });

    expect(input.className).toContain('border-danger-500');
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('merges a consumer class override, winning over the internal class', () => {
    const { input } = createHost({ extraClass: 'rounded-full' });

    expect(input.className).toContain('rounded-full');
    expect(input.className).not.toContain('rounded-md');
  });

  describe('ControlValueAccessor', () => {
    function createDirectiveOnly() {
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      const directive = fixture.debugElement.children[0].injector.get(InputTextDirective);
      return { fixture, input, directive };
    }

    it('writeValue sets the native input value', () => {
      const { fixture, input, directive } = createDirectiveOnly();
      directive.writeValue('hello');
      fixture.detectChanges();

      expect(input.value).toBe('hello');
    });

    it('writeValue(null) and writeValue(undefined) render as an empty string, not the literal text', () => {
      const { fixture, input, directive } = createDirectiveOnly();

      directive.writeValue(null);
      fixture.detectChanges();
      expect(input.value).toBe('');

      directive.writeValue(undefined);
      fixture.detectChanges();
      expect(input.value).toBe('');
    });

    it('emits the typed value through registerOnChange on input events', () => {
      const { input, directive } = createDirectiveOnly();
      const received: string[] = [];
      directive.registerOnChange((value) => received.push(value));

      typeInto(input, 'abc');

      expect(received).toEqual(['abc']);
    });

    it('setDisabledState disables the native input', () => {
      const { fixture, input, directive } = createDirectiveOnly();
      directive.setDisabledState(true);
      fixture.detectChanges();

      expect(input.disabled).toBe(true);
    });
  });

  it('a real keyboard keystroke (keydown + input, not just a synthetic "input" dispatch) reaches registerOnChange, proving typing itself needs no directive-level keyboard handling — the native input element already owns it', () => {
    const { input, directive } = (() => {
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      const inputEl = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      const dir = fixture.debugElement.children[0].injector.get(InputTextDirective);
      return { input: inputEl, directive: dir };
    })();
    const received: string[] = [];
    directive.registerOnChange((value) => received.push(value));

    input.focus();
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    input.value = 'a';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keyup', { key: 'a', bubbles: true }));

    expect(received).toEqual(['a']);
  });

  it('a FormControl initialized with null renders an empty field and updates on typing (real-world regression)', () => {
    @Component({
      standalone: true,
      imports: [InputTextDirective, ReactiveFormsModule],
      template: `<input medInputText type="text" [formControl]="control" />`,
    })
    class ReactiveHostComponent {
      readonly control = new FormControl<string | null>(null);
    }

    const fixture = TestBed.createComponent(ReactiveHostComponent);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(input.value).toBe('');

    typeInto(input, 'medraui');
    expect(fixture.componentInstance.control.value).toBe('medraui');
  });

  it('[UI-010.S1] applies variant="filled" and fluid styling', () => {
    @Component({
      standalone: true,
      imports: [InputTextDirective],
      template: `<input medInputText variant="filled" [fluid]="true" />`,
    })
    class VariantFluidHost {}

    const fixture = TestBed.createComponent(VariantFluidHost);
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(el.getAttribute('data-variant')).toBe('filled');
    expect(el.className).toContain('w-full');
  });
});
