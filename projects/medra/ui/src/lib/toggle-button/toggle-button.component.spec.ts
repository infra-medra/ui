import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { ToggleButtonComponent } from './toggle-button.component';

function nativeButton(fixture: { nativeElement: HTMLElement }): HTMLButtonElement {
  return fixture.nativeElement.querySelector('button') as HTMLButtonElement;
}

function firePointerDown(el: HTMLElement) {
  const event = Object.assign(new Event('pointerdown', { bubbles: true }), { clientX: 5, clientY: 5 });
  el.dispatchEvent(event as PointerEvent);
}

describe('ToggleButtonComponent', () => {
  let animateSpy: jest.Mock;

  beforeEach(() => {
    animateSpy = jest.fn().mockReturnValue({ finished: Promise.resolve() });
    HTMLElement.prototype.animate = animateSpy as unknown as HTMLElement['animate'];
  });

  afterEach(() => {
    delete (HTMLElement.prototype as { animate?: unknown }).animate;
  });

  function createToggleButton() {
    const fixture = TestBed.createComponent(ToggleButtonComponent);
    fixture.detectChanges();
    return { fixture, button: nativeButton(fixture) };
  }

  it('triggers the ripple effect on pointerdown (Ripple adoption)', () => {
    const { button } = createToggleButton();
    firePointerDown(button);
    expect(animateSpy).toHaveBeenCalledTimes(1);
  });

  it('renders unpressed by default, showing offLabel', () => {
    const { button } = createToggleButton();
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.textContent?.trim()).toBe('No');
  });

  it('clicking toggles pressed state, label, and pushes the value through onChange', () => {
    const { fixture, button } = createToggleButton();
    const received: boolean[] = [];
    fixture.componentInstance.registerOnChange((value) => received.push(value));

    button.click();
    fixture.detectChanges();

    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.textContent?.trim()).toBe('Yes');
    expect(received).toEqual([true]);

    button.click();
    fixture.detectChanges();
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(received).toEqual([true, false]);
  });

  it('supports custom onLabel/offLabel', () => {
    const fixture = TestBed.createComponent(ToggleButtonComponent);
    fixture.componentRef.setInput('onLabel', 'Public');
    fixture.componentRef.setInput('offLabel', 'Private');
    fixture.detectChanges();

    const button = nativeButton(fixture);
    expect(button.textContent?.trim()).toBe('Private');
    button.click();
    fixture.detectChanges();
    expect(button.textContent?.trim()).toBe('Public');
  });

  it('shows onIcon/offIcon matching the current state', () => {
    const fixture = TestBed.createComponent(ToggleButtonComponent);
    fixture.componentRef.setInput('onIcon', 'lock-closed');
    fixture.componentRef.setInput('offIcon', 'lock-open');
    fixture.detectChanges();

    const icon = () => fixture.debugElement.query(By.directive(IconComponent))?.componentInstance as IconComponent | undefined;
    expect(icon()?.name()).toBe('lock-open');
    nativeButton(fixture).click();
    fixture.detectChanges();
    expect(icon()?.name()).toBe('lock-closed');
  });

  it('writeValue(false/null/undefined) all normalize to unpressed, never throwing', () => {
    const { fixture, button } = createToggleButton();
    const toggleButton = fixture.componentInstance;

    toggleButton.writeValue(true);
    fixture.detectChanges();
    toggleButton.writeValue(false);
    fixture.detectChanges();
    expect(button.getAttribute('aria-pressed')).toBe('false');

    expect(() => toggleButton.writeValue(null)).not.toThrow();
    fixture.detectChanges();
    expect(button.getAttribute('aria-pressed')).toBe('false');

    expect(() => toggleButton.writeValue(undefined as unknown as boolean)).not.toThrow();
    fixture.detectChanges();
    expect(button.getAttribute('aria-pressed')).toBe('false');
  });

  it('a FormControl initialized with true renders pressed', () => {
    @Component({
      standalone: true,
      imports: [ToggleButtonComponent, ReactiveFormsModule],
      template: `<med-toggle-button [formControl]="control" />`,
    })
    class HostComponent {
      readonly control = new FormControl(true, { nonNullable: true });
    }

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(nativeButton(fixture).getAttribute('aria-pressed')).toBe('true');
  });

  it('does not toggle when disabled, and disables the native button', () => {
    const fixture = TestBed.createComponent(ToggleButtonComponent);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const button = nativeButton(fixture);

    expect(button.disabled).toBe(true);
    button.click();
    fixture.detectChanges();
    expect(button.getAttribute('aria-pressed')).toBe('false');
  });

  it('disables via setDisabledState (Reactive Forms disable())', () => {
    const { fixture, button } = createToggleButton();
    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();
    expect(button.disabled).toBe(true);
  });

  it('sets aria-invalid when invalid is true', () => {
    const fixture = TestBed.createComponent(ToggleButtonComponent);
    fixture.componentRef.setInput('invalid', true);
    fixture.detectChanges();
    expect(nativeButton(fixture).getAttribute('aria-invalid')).toBe('true');
  });

  it('applies filled/primary styling when pressed and outlined/secondary when not', () => {
    const { fixture, button } = createToggleButton();
    expect(button.className).toContain('border-surface-300');

    button.click();
    fixture.detectChanges();
    expect(button.className).toContain('bg-brand-500');
  });

  it('merges a consumer class override', () => {
    const fixture = TestBed.createComponent(ToggleButtonComponent);
    fixture.componentRef.setInput('class', 'w-32');
    fixture.detectChanges();
    expect(nativeButton(fixture).className).toContain('w-32');
  });

  it('applies the inputId to the native button', () => {
    const fixture = TestBed.createComponent(ToggleButtonComponent);
    fixture.componentRef.setInput('inputId', 'newsletter-opt-in');
    fixture.detectChanges();
    expect(nativeButton(fixture).id).toBe('newsletter-opt-in');
  });

  // @scenario UI-005.S3
  it('positions the icon after the label when iconPos is right', () => {
    const fixture = TestBed.createComponent(ToggleButtonComponent);
    fixture.componentRef.setInput('offIcon', 'lock-open');
    fixture.componentRef.setInput('iconPos', 'right');
    fixture.detectChanges();

    const button = nativeButton(fixture);
    const children = Array.from(button.childNodes).filter(
      (n) => n.nodeType === Node.ELEMENT_NODE || (n.nodeType === Node.TEXT_NODE && n.textContent?.trim()),
    );
    expect(children[0].textContent?.trim()).toBe('No');
    expect((children[1] as Element).tagName.toLowerCase()).toBe('med-icon');
  });

  it('ignores clicks and sets aria-readonly when readonly is true', () => {
    const fixture = TestBed.createComponent(ToggleButtonComponent);
    fixture.componentRef.setInput('readonly', true);
    fixture.detectChanges();

    const button = nativeButton(fixture);
    expect(button.getAttribute('aria-readonly')).toBe('true');
    button.click();
    fixture.detectChanges();
    expect(button.getAttribute('aria-pressed')).toBe('false');
  });

  it('prevents unpressing when allowEmpty is false', () => {
    const fixture = TestBed.createComponent(ToggleButtonComponent);
    fixture.componentRef.setInput('allowEmpty', false);
    fixture.detectChanges();

    const button = nativeButton(fixture);
    button.click();
    fixture.detectChanges();
    expect(button.getAttribute('aria-pressed')).toBe('true');

    button.click();
    fixture.detectChanges();
    expect(button.getAttribute('aria-pressed')).toBe('true');
  });
});
