import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { PasswordComponent } from './password.component';

function trigger(fixture: ComponentFixture<unknown>): HTMLInputElement {
  return fixture.nativeElement.querySelector('input') as HTMLInputElement;
}

function typeText(fixture: ComponentFixture<unknown>, text: string): void {
  const el = trigger(fixture);
  el.value = text;
  el.dispatchEvent(new Event('input'));
  fixture.detectChanges();
}

function feedbackPanel(): HTMLElement | null {
  return document.querySelector('[role="status"]');
}

describe('PasswordComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [OverlayModule] });
  });

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  function createPassword(): ComponentFixture<PasswordComponent> {
    const fixture = TestBed.createComponent(PasswordComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('renders a native password input by default', () => {
    const fixture = createPassword();
    expect(trigger(fixture).type).toBe('password');
  });

  it('writeValue sets the input value', () => {
    const fixture = createPassword();
    fixture.componentInstance.writeValue('hunter2');
    fixture.detectChanges();
    expect(trigger(fixture).value).toBe('hunter2');
  });

  it('writeValue(null) shows an empty input, not a stray "null"', () => {
    const fixture = createPassword();
    fixture.componentInstance.writeValue('hunter2');
    fixture.detectChanges();
    fixture.componentInstance.writeValue(null);
    fixture.detectChanges();
    expect(trigger(fixture).value).toBe('');
  });

  it('commits typed text live via onChange', () => {
    const fixture = createPassword();
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);
    typeText(fixture, 'hunter2');
    expect(onChange).toHaveBeenCalledWith('hunter2');
  });

  it('does not render a toggle button by default', () => {
    const fixture = createPassword();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('toggleMask reveals/hides the value and swaps the input type', () => {
    const fixture = createPassword();
    fixture.componentRef.setInput('toggleMask', true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(trigger(fixture).type).toBe('password');
    expect(button.getAttribute('aria-label')).toBe('Show password');

    button.click();
    fixture.detectChanges();
    expect(trigger(fixture).type).toBe('text');
    expect(button.getAttribute('aria-label')).toBe('Hide password');

    button.click();
    fixture.detectChanges();
    expect(trigger(fixture).type).toBe('password');
  });

  it('sets aria-invalid when invalid is true, and omits it otherwise (Wave 2 test-coverage fix — the binding already existed, untested)', () => {
    const fixture = createPassword();
    fixture.componentRef.setInput('invalid', true);
    fixture.detectChanges();
    expect(trigger(fixture).getAttribute('aria-invalid')).toBe('true');

    fixture.componentRef.setInput('invalid', false);
    fixture.detectChanges();
    expect(trigger(fixture).getAttribute('aria-invalid')).toBeNull();
  });

  it('sets aria-describedby to the feedback panel id only while the panel is open, and clears it on blur (Wave 2 test-coverage fix — the binding already existed, untested)', () => {
    const fixture = createPassword();
    fixture.componentRef.setInput('feedback', true);
    fixture.detectChanges();
    expect(trigger(fixture).getAttribute('aria-describedby')).toBeNull();

    trigger(fixture).dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    const describedBy = trigger(fixture).getAttribute('aria-describedby');
    expect(describedBy).not.toBeNull();
    expect(feedbackPanel()?.getAttribute('id')).toBe(describedBy);

    trigger(fixture).dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    fixture.detectChanges();
    expect(trigger(fixture).getAttribute('aria-describedby')).toBeNull();
  });

  it('the toggle button is a native <button type="button">, and a keyboard-triggered activation (Enter/Space, which a real browser turns into a click with no directive keydown handling to interfere) toggles the mask exactly like a mouse click', () => {
    const fixture = createPassword();
    fixture.componentRef.setInput('toggleMask', true);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.tagName).toBe('BUTTON');
    expect(button.type).toBe('button');

    // What a real browser synthesizes from a focused button's Enter/Space
    // keypress — dispatched directly since jsdom does not simulate that
    // activation behavior itself (see button.directive.spec.ts for the same
    // pattern/reasoning).
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(trigger(fixture).type).toBe('text');
  });

  it('does not open a feedback panel by default', () => {
    const fixture = createPassword();
    trigger(fixture).dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(feedbackPanel()).toBeNull();
  });

  it('feedback opens a strength panel on focus and closes it on blur', () => {
    const fixture = createPassword();
    fixture.componentRef.setInput('feedback', true);
    fixture.detectChanges();

    trigger(fixture).dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(feedbackPanel()).not.toBeNull();
    expect(feedbackPanel()?.textContent).toContain('Please enter a password');

    typeText(fixture, 'Abcdef1!');
    fixture.detectChanges();
    expect(feedbackPanel()?.textContent).toContain('Strong');

    trigger(fixture).dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    fixture.detectChanges();
    expect(feedbackPanel()).toBeNull();
  });

  it('does not steal DOM focus when opening the feedback panel', () => {
    const fixture = createPassword();
    fixture.componentRef.setInput('feedback', true);
    fixture.detectChanges();

    const input = trigger(fixture);
    input.focus();
    input.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(document.activeElement).toBe(input);
  });

  describe('showClear', () => {
    it('is not shown when there is no value', () => {
      const fixture = createPassword();
      fixture.componentRef.setInput('showClear', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('button[aria-label="Clear"]')).toBeNull();
    });

    it('shows once a value is written, and clears it back to an empty string on click', () => {
      const fixture = createPassword();
      fixture.componentRef.setInput('showClear', true);
      fixture.componentInstance.writeValue('hunter2');
      fixture.detectChanges();
      const onChange = jest.fn();
      fixture.componentInstance.registerOnChange(onChange);

      const clearButton = fixture.nativeElement.querySelector('button[aria-label="Clear"]') as HTMLButtonElement;
      expect(clearButton).not.toBeNull();
      clearButton.click();
      fixture.detectChanges();

      expect(trigger(fixture).value).toBe('');
      expect(onChange).toHaveBeenCalledWith('');
      expect(fixture.nativeElement.querySelector('button[aria-label="Clear"]')).toBeNull();
    });

    it('is never shown while disabled, even with a value', () => {
      const fixture = createPassword();
      fixture.componentRef.setInput('showClear', true);
      fixture.componentRef.setInput('disabled', true);
      fixture.componentInstance.writeValue('hunter2');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('button[aria-label="Clear"]')).toBeNull();
    });

    it('sits alongside the mask toggle when both are enabled', () => {
      const fixture = createPassword();
      fixture.componentRef.setInput('showClear', true);
      fixture.componentRef.setInput('toggleMask', true);
      fixture.componentInstance.writeValue('hunter2');
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button');
      expect(buttons.length).toBe(2);
      expect(buttons[0].getAttribute('aria-label')).toBe('Clear');
      expect(buttons[1].getAttribute('aria-label')).toBe('Show password');
    });
  });

  it('setDisabledState disables the native input', () => {
    const fixture = createPassword();
    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();
    expect(trigger(fixture).disabled).toBe(true);
  });

  describe('with ReactiveFormsModule', () => {
    @Component({
      standalone: true,
      imports: [PasswordComponent, ReactiveFormsModule],
      template: `<med-password [formControl]="control" />`,
    })
    class HostComponent {
      readonly control = new FormControl('');
    }

    it('reflects the FormControl value and pushes updates back through it', () => {
      TestBed.configureTestingModule({ imports: [HostComponent] });
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();

      fixture.componentInstance.control.setValue('seed');
      fixture.detectChanges();
      expect(trigger(fixture).value).toBe('seed');

      typeText(fixture, 'typed');
      expect(fixture.componentInstance.control.value).toBe('typed');
    });
  });
});
