import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputNumberComponent } from './input-number.component';

function trigger(fixture: ComponentFixture<unknown>): HTMLInputElement {
  return fixture.nativeElement.querySelector('[role="spinbutton"]') as HTMLInputElement;
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

describe('InputNumberComponent', () => {
  function createInputNumber(): ComponentFixture<InputNumberComponent> {
    const fixture = TestBed.createComponent(InputNumberComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('writeValue displays the formatted number', () => {
    const fixture = createInputNumber();
    fixture.componentInstance.writeValue(1234.5);
    fixture.detectChanges();
    expect(trigger(fixture).value).toBe('1,234.5');
  });

  it('writeValue(null) shows an empty input, not a stray "null"', () => {
    const fixture = createInputNumber();
    fixture.componentInstance.writeValue(42);
    fixture.detectChanges();
    fixture.componentInstance.writeValue(null);
    fixture.detectChanges();
    expect(trigger(fixture).value).toBe('');
  });

  it('commits a typed value live once it parses', () => {
    const fixture = createInputNumber();
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);
    typeText(fixture, '42');
    expect(onChange).toHaveBeenCalledWith(42);
  });

  it('does not commit a typed value that parses out of bounds', () => {
    const fixture = createInputNumber();
    fixture.componentRef.setInput('max', 10);
    fixture.detectChanges();
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);
    typeText(fixture, '42');
    expect(onChange).not.toHaveBeenCalled();
    expect(trigger(fixture).value).toBe('42');
  });

  it('reformats from the last committed value on blur, reverting stray text', () => {
    const fixture = createInputNumber();
    fixture.componentInstance.writeValue(5);
    fixture.detectChanges();
    typeText(fixture, '5x');
    blur(fixture);
    expect(trigger(fixture).value).toBe('5');
  });

  it('ArrowUp/ArrowDown step by `step`', () => {
    const fixture = createInputNumber();
    fixture.componentRef.setInput('step', 5);
    fixture.detectChanges();
    fixture.componentInstance.writeValue(10);
    fixture.detectChanges();
    keydown(fixture, 'ArrowUp');
    expect(trigger(fixture).value).toBe('15');
    keydown(fixture, 'ArrowDown');
    keydown(fixture, 'ArrowDown');
    expect(trigger(fixture).value).toBe('5');
  });

  it('PageUp/PageDown step by `step * 10`', () => {
    const fixture = createInputNumber();
    fixture.componentInstance.writeValue(0);
    fixture.detectChanges();
    keydown(fixture, 'PageUp');
    expect(trigger(fixture).value).toBe('10');
    keydown(fixture, 'PageDown');
    keydown(fixture, 'PageDown');
    expect(trigger(fixture).value).toBe('-10');
  });

  it('does not step past `min`/`max`', () => {
    const fixture = createInputNumber();
    fixture.componentRef.setInput('min', 0);
    fixture.componentRef.setInput('max', 5);
    fixture.detectChanges();
    fixture.componentInstance.writeValue(5);
    fixture.detectChanges();
    keydown(fixture, 'ArrowUp');
    expect(trigger(fixture).value).toBe('5');
    fixture.componentInstance.writeValue(0);
    fixture.detectChanges();
    keydown(fixture, 'ArrowDown');
    expect(trigger(fixture).value).toBe('0');
  });

  it('Home/End jump to min/max', () => {
    const fixture = createInputNumber();
    fixture.componentRef.setInput('min', -20);
    fixture.componentRef.setInput('max', 20);
    fixture.detectChanges();
    fixture.componentInstance.writeValue(0);
    fixture.detectChanges();
    keydown(fixture, 'End');
    expect(trigger(fixture).value).toBe('20');
    keydown(fixture, 'Home');
    expect(trigger(fixture).value).toBe('-20');
  });

  it('starts stepping from `min` (not 0) when there is no value yet and `min` is positive', () => {
    const fixture = createInputNumber();
    fixture.componentRef.setInput('min', 10);
    fixture.detectChanges();
    keydown(fixture, 'ArrowUp');
    expect(trigger(fixture).value).toBe('11');
  });

  it('avoids floating-point drift when repeatedly stepping by a fractional step', () => {
    const fixture = createInputNumber();
    fixture.componentRef.setInput('step', 0.1);
    fixture.detectChanges();
    fixture.componentInstance.writeValue(0.1);
    fixture.detectChanges();
    keydown(fixture, 'ArrowUp');
    keydown(fixture, 'ArrowUp');
    expect(trigger(fixture).value).toBe('0.3');
  });

  it('sets aria-valuenow/aria-valuemin/aria-valuemax/aria-valuetext', () => {
    const fixture = createInputNumber();
    fixture.componentRef.setInput('min', 0);
    fixture.componentRef.setInput('max', 100);
    fixture.detectChanges();
    fixture.componentInstance.writeValue(42);
    fixture.detectChanges();
    const el = trigger(fixture);
    expect(el.getAttribute('aria-valuenow')).toBe('42');
    expect(el.getAttribute('aria-valuemin')).toBe('0');
    expect(el.getAttribute('aria-valuemax')).toBe('100');
    expect(el.getAttribute('aria-valuetext')).toBe('42');
  });

  it('sets aria-invalid when invalid is true, and omits it otherwise (Wave 2 test-coverage fix — the binding already existed, untested)', () => {
    const fixture = createInputNumber();
    fixture.componentRef.setInput('invalid', true);
    fixture.detectChanges();
    expect(trigger(fixture).getAttribute('aria-invalid')).toBe('true');

    fixture.componentRef.setInput('invalid', false);
    fixture.detectChanges();
    expect(trigger(fixture).getAttribute('aria-invalid')).toBeNull();
  });

  it('formats as currency when mode="currency"', () => {
    const fixture = createInputNumber();
    fixture.componentRef.setInput('mode', 'currency');
    fixture.componentRef.setInput('currency', 'USD');
    fixture.detectChanges();
    fixture.componentInstance.writeValue(19.9);
    fixture.detectChanges();
    expect(trigger(fixture).value).toBe('$19.90');
  });

  it('applies prefix and suffix', () => {
    const fixture = createInputNumber();
    fixture.componentRef.setInput('prefix', '~');
    fixture.componentRef.setInput('suffix', ' kg');
    fixture.detectChanges();
    fixture.componentInstance.writeValue(42);
    fixture.detectChanges();
    expect(trigger(fixture).value).toBe('~42 kg');
  });

  it('renders stacked increment/decrement buttons when showButtons is set', () => {
    const fixture = createInputNumber();
    fixture.componentRef.setInput('showButtons', true);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons.length).toBe(2);
  });

  it('increment/decrement buttons step the value and stay disabled at the bounds', () => {
    const fixture = createInputNumber();
    fixture.componentRef.setInput('showButtons', true);
    fixture.componentRef.setInput('min', 0);
    fixture.componentRef.setInput('max', 1);
    fixture.detectChanges();
    fixture.componentInstance.writeValue(0);
    fixture.detectChanges();

    const [incrementButton, decrementButton] = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    expect(decrementButton.disabled).toBe(true);
    incrementButton.click();
    fixture.detectChanges();
    expect(trigger(fixture).value).toBe('1');
    expect(incrementButton.disabled).toBe(true);
  });

  describe('buttonLayout="vertical"', () => {
    it('renders increment above the input, decrement below it', () => {
      const fixture = createInputNumber();
      fixture.componentRef.setInput('showButtons', true);
      fixture.componentRef.setInput('buttonLayout', 'vertical');
      fixture.detectChanges();

      const children = Array.from(fixture.nativeElement.children) as HTMLElement[];
      // host: [increment button, input-wrapper div, decrement button]
      expect(children[0].tagName).toBe('BUTTON');
      expect(children[0].getAttribute('aria-label')).toBe('Increment');
      expect(children[children.length - 1].tagName).toBe('BUTTON');
      expect(children[children.length - 1].getAttribute('aria-label')).toBe('Decrement');
    });

    it('steps the value and disables at the bounds, same as the other layouts', () => {
      const fixture = createInputNumber();
      fixture.componentRef.setInput('showButtons', true);
      fixture.componentRef.setInput('buttonLayout', 'vertical');
      fixture.componentRef.setInput('min', 0);
      fixture.componentRef.setInput('max', 1);
      fixture.detectChanges();
      fixture.componentInstance.writeValue(1);
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
      const incrementButton = Array.from(buttons).find((b) => b.getAttribute('aria-label') === 'Increment')!;
      const decrementButton = Array.from(buttons).find((b) => b.getAttribute('aria-label') === 'Decrement')!;
      expect(incrementButton.disabled).toBe(true);

      decrementButton.click();
      fixture.detectChanges();
      expect(trigger(fixture).value).toBe('0');
    });
  });

  describe('showClear', () => {
    it('is not shown when there is no value', () => {
      const fixture = createInputNumber();
      fixture.componentRef.setInput('showClear', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('button[aria-label="Clear"]')).toBeNull();
    });

    it('shows once a value is written, and clears it back to null on click', () => {
      const fixture = createInputNumber();
      fixture.componentRef.setInput('showClear', true);
      fixture.componentInstance.writeValue(42);
      fixture.detectChanges();
      const onChange = jest.fn();
      fixture.componentInstance.registerOnChange(onChange);

      const clearButton = fixture.nativeElement.querySelector('button[aria-label="Clear"]') as HTMLButtonElement;
      expect(clearButton).not.toBeNull();
      clearButton.click();
      fixture.detectChanges();

      expect(trigger(fixture).value).toBe('');
      expect(onChange).toHaveBeenCalledWith(null);
      expect(fixture.nativeElement.querySelector('button[aria-label="Clear"]')).toBeNull();
    });

    it('is never shown while disabled, even with a value', () => {
      const fixture = createInputNumber();
      fixture.componentRef.setInput('showClear', true);
      fixture.componentRef.setInput('disabled', true);
      fixture.componentInstance.writeValue(42);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('button[aria-label="Clear"]')).toBeNull();
    });
  });

  it('setDisabledState disables the native input', () => {
    const fixture = createInputNumber();
    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();
    expect(trigger(fixture).disabled).toBe(true);
  });

  it('does not respond to keyboard stepping while disabled', () => {
    const fixture = createInputNumber();
    fixture.componentInstance.writeValue(5);
    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();
    keydown(fixture, 'ArrowUp');
    expect(trigger(fixture).value).toBe('5');
  });

  describe('with ReactiveFormsModule', () => {
    @Component({
      standalone: true,
      imports: [InputNumberComponent, ReactiveFormsModule],
      template: `<med-input-number [formControl]="control" />`,
    })
    class HostComponent {
      readonly control = new FormControl<number | null>(3);
    }

    it('reflects the FormControl value and pushes updates back through it', () => {
      TestBed.configureTestingModule({ imports: [HostComponent] });
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      expect(trigger(fixture).value).toBe('3');

      fixture.componentInstance.control.setValue(9);
      fixture.detectChanges();
      expect(trigger(fixture).value).toBe('9');

      typeText(fixture, '15');
      expect(fixture.componentInstance.control.value).toBe(15);
    });
  });

  it('[UI-010.S1] applies variant="filled" and fluid styling', () => {
    @Component({
      standalone: true,
      imports: [InputNumberComponent],
      template: `<med-input-number variant="filled" [fluid]="true" />`,
    })
    class VariantFluidHost {}

    const fixture = TestBed.createComponent(VariantFluidHost);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector('med-input-number') as HTMLElement;

    expect(host.getAttribute('data-variant')).toBe('filled');
    expect(host.className).toContain('w-full');
  });
});
