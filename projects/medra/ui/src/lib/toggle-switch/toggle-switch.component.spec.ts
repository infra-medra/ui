import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ToggleSwitchComponent } from './toggle-switch.component';

function nativeInput(fixture: { nativeElement: HTMLElement }): HTMLInputElement {
  return fixture.nativeElement.querySelector('input[type="checkbox"]') as HTMLInputElement;
}

function toggle(input: HTMLInputElement, checked: boolean) {
  input.checked = checked;
  input.dispatchEvent(new Event('change'));
}

describe('ToggleSwitchComponent', () => {
  function createToggleSwitch() {
    const fixture = TestBed.createComponent(ToggleSwitchComponent);
    fixture.detectChanges();
    return { fixture, input: nativeInput(fixture) };
  }

  it('renders unchecked by default', () => {
    const { input } = createToggleSwitch();
    expect(input.checked).toBe(false);
  });

  it('sets role="switch" on the native input', () => {
    const { input } = createToggleSwitch();
    expect(input.getAttribute('role')).toBe('switch');
  });

  it('toggling the native input updates state and pushes it through onChange', () => {
    const { fixture, input } = createToggleSwitch();
    const received: boolean[] = [];
    fixture.componentInstance.registerOnChange((value) => received.push(value as boolean));

    toggle(input, true);
    fixture.detectChanges();

    expect(input.checked).toBe(true);
    expect(received).toEqual([true]);
  });

  it('writeValue(false/null/undefined) all normalize to unchecked, never throwing', () => {
    const { fixture, input } = createToggleSwitch();
    const toggleSwitch = fixture.componentInstance;

    toggleSwitch.writeValue(true);
    fixture.detectChanges();
    toggleSwitch.writeValue(false);
    fixture.detectChanges();
    expect(input.checked).toBe(false);

    expect(() => toggleSwitch.writeValue(null)).not.toThrow();
    fixture.detectChanges();
    expect(input.checked).toBe(false);

    expect(() => toggleSwitch.writeValue(undefined as unknown as boolean)).not.toThrow();
    fixture.detectChanges();
    expect(input.checked).toBe(false);
  });

  it('a FormControl initialized with true renders checked', () => {
    @Component({
      standalone: true,
      imports: [ToggleSwitchComponent, ReactiveFormsModule],
      template: `<med-toggle-switch [formControl]="control" />`,
    })
    class HostComponent {
      readonly control = new FormControl(true, { nonNullable: true });
    }

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(nativeInput(fixture).checked).toBe(true);
  });

  it('disables the native input via the disabled input', () => {
    const fixture = TestBed.createComponent(ToggleSwitchComponent);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(nativeInput(fixture).disabled).toBe(true);
  });

  it('disables the native input via setDisabledState (Reactive Forms disable())', () => {
    const { fixture, input } = createToggleSwitch();
    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();
    expect(input.disabled).toBe(true);
  });

  it('sets aria-invalid when invalid is true', () => {
    const fixture = TestBed.createComponent(ToggleSwitchComponent);
    fixture.componentRef.setInput('invalid', true);
    fixture.detectChanges();
    expect(nativeInput(fixture).getAttribute('aria-invalid')).toBe('true');
  });

  it.each([
    ['sm', 'h-4 w-7'],
    ['default', 'h-5 w-9'],
    ['lg', 'h-6 w-11'],
  ] as const)('applies the track size class for size=%s', (size, expectedClasses) => {
    const fixture = TestBed.createComponent(ToggleSwitchComponent);
    fixture.componentRef.setInput('size', size);
    fixture.detectChanges();

    const spans = fixture.nativeElement.querySelectorAll('span[aria-hidden="true"]');
    const track = spans[0] as HTMLElement;
    for (const cls of expectedClasses.split(' ')) {
      expect(track.className).toContain(cls);
    }
  });

  it('merges a consumer class override onto the track', () => {
    const fixture = TestBed.createComponent(ToggleSwitchComponent);
    fixture.componentRef.setInput('class', 'ring-2');
    fixture.detectChanges();

    const track = fixture.nativeElement.querySelectorAll('span[aria-hidden="true"]')[0] as HTMLElement;
    expect(track.className).toContain('ring-2');
  });

  it('applies the inputId to the native input for external label pairing', () => {
    const fixture = TestBed.createComponent(ToggleSwitchComponent);
    fixture.componentRef.setInput('inputId', 'notifications-enabled');
    fixture.detectChanges();
    expect(nativeInput(fixture).id).toBe('notifications-enabled');
  });

  it('[UI-010.S1] supports trueValue/falseValue and readonly guard', () => {
    const fixture = TestBed.createComponent(ToggleSwitchComponent);
    fixture.componentRef.setInput('trueValue', 'Y');
    fixture.componentRef.setInput('falseValue', 'N');
    fixture.componentInstance.writeValue('N');
    fixture.detectChanges();

    const emitted: unknown[] = [];
    fixture.componentInstance.registerOnChange((v) => emitted.push(v));

    nativeInput(fixture).click();
    fixture.detectChanges();
    expect(emitted).toEqual(['Y']);

    fixture.componentRef.setInput('readonly', true);
    fixture.detectChanges();
    nativeInput(fixture).click();
    fixture.detectChanges();
    expect(emitted).toEqual(['Y']);
  });
});
