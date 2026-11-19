import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RadioButtonComponent } from './radio-button.component';

function nativeInputs(fixture: { nativeElement: HTMLElement }): HTMLInputElement[] {
  return [...fixture.nativeElement.querySelectorAll('input[type="radio"]')] as HTMLInputElement[];
}

describe('RadioButtonComponent', () => {
  it('renders unchecked by default with no dot', () => {
    const fixture = TestBed.createComponent(RadioButtonComponent);
    fixture.componentRef.setInput('name', 'plan');
    fixture.componentRef.setInput('value', 'free');
    fixture.detectChanges();

    const [input] = nativeInputs(fixture);
    expect(input.checked).toBe(false);
    expect(fixture.nativeElement.querySelector('.bg-brand-500')).toBeNull();
  });

  it('toggling the native input marks it checked and shows the dot', () => {
    const fixture = TestBed.createComponent(RadioButtonComponent);
    fixture.componentRef.setInput('name', 'plan');
    fixture.componentRef.setInput('value', 'free');
    fixture.detectChanges();

    const [input] = nativeInputs(fixture);
    input.checked = true;
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.bg-brand-500')).not.toBeNull();
  });

  describe('group behavior via a shared FormControl', () => {
    @Component({
      standalone: true,
      imports: [RadioButtonComponent, ReactiveFormsModule],
      template: `
        <med-radio-button name="plan" value="free" [formControl]="plan" />
        <med-radio-button name="plan" value="pro" [formControl]="plan" />
      `,
    })
    class GroupHostComponent {
      readonly plan = new FormControl<string | null>('free');
    }

    it('only the radio matching the control value is checked', () => {
      const fixture = TestBed.createComponent(GroupHostComponent);
      fixture.detectChanges();
      const [freeInput, proInput] = nativeInputs(fixture);

      expect(freeInput.checked).toBe(true);
      expect(proInput.checked).toBe(false);
    });

    it('selecting one radio deselects the other through the shared control', () => {
      const fixture = TestBed.createComponent(GroupHostComponent);
      fixture.detectChanges();
      const [freeInput, proInput] = nativeInputs(fixture);

      proInput.checked = true;
      proInput.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      expect(fixture.componentInstance.plan.value).toBe('pro');
      expect(freeInput.checked).toBe(false);
      expect(proInput.checked).toBe(true);
    });
  });

  it('disables the native input via the disabled input', () => {
    const fixture = TestBed.createComponent(RadioButtonComponent);
    fixture.componentRef.setInput('name', 'plan');
    fixture.componentRef.setInput('value', 'free');
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    expect(nativeInputs(fixture)[0].disabled).toBe(true);
  });

  it('disables the native input via setDisabledState (Reactive Forms disable())', () => {
    const fixture = TestBed.createComponent(RadioButtonComponent);
    fixture.componentRef.setInput('name', 'plan');
    fixture.componentRef.setInput('value', 'free');
    fixture.detectChanges();
    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();

    expect(nativeInputs(fixture)[0].disabled).toBe(true);
  });

  it('sets aria-invalid when invalid is true', () => {
    const fixture = TestBed.createComponent(RadioButtonComponent);
    fixture.componentRef.setInput('name', 'plan');
    fixture.componentRef.setInput('value', 'free');
    fixture.componentRef.setInput('invalid', true);
    fixture.detectChanges();

    expect(nativeInputs(fixture)[0].getAttribute('aria-invalid')).toBe('true');
  });

  it('is a real native <input type="radio">, so Space/click activation is entirely native — the same DOM activation behavior checks it and fires the shared FormControl, with no directive-level keydown handling (Wave 2 keyboard-coverage fix). Arrow-key movement *between* same-`name` radios is likewise entirely browser-native group behavior — MedraUi never reimplements it, it only needs to keep emitting real `<input type="radio" name="...">` elements for the browser to drive.', () => {
    const fixture = TestBed.createComponent(RadioButtonComponent);
    fixture.componentRef.setInput('name', 'plan');
    fixture.componentRef.setInput('value', 'free');
    fixture.detectChanges();
    const [input] = nativeInputs(fixture);
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);

    input.click(); // jsdom's real activation behavior for a radio — the same one a focused Space keypress triggers in a real browser

    expect(input.checked).toBe(true);
    expect(onChange).toHaveBeenCalledWith('free');
  });

  it('applies the inputId to the native input for external label pairing', () => {
    const fixture = TestBed.createComponent(RadioButtonComponent);
    fixture.componentRef.setInput('name', 'plan');
    fixture.componentRef.setInput('value', 'free');
    fixture.componentRef.setInput('inputId', 'plan-free');
    fixture.detectChanges();

    expect(nativeInputs(fixture)[0].id).toBe('plan-free');
  });

  it('merges a consumer class override onto the ring', () => {
    const fixture = TestBed.createComponent(RadioButtonComponent);
    fixture.componentRef.setInput('name', 'plan');
    fixture.componentRef.setInput('value', 'free');
    fixture.componentRef.setInput('class', 'border-4');
    fixture.detectChanges();

    const ring = fixture.nativeElement.querySelector('span[aria-hidden="true"]') as HTMLElement;
    expect(ring.className).toContain('border-4');
    expect(ring.className).not.toContain('border-2');
  });

  it('[UI-010.S1] applies variant="filled"', () => {
    const fixture = TestBed.createComponent(RadioButtonComponent);
    fixture.componentRef.setInput('name', 'grp');
    fixture.componentRef.setInput('value', 'a');
    fixture.componentRef.setInput('variant', 'filled');
    fixture.detectChanges();

    expect(fixture.nativeElement.getAttribute('data-variant')).toBe('filled');
  });
});
