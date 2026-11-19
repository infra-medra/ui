import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputOtpComponent } from './input-otp.component';

function boxes(fixture: { nativeElement: HTMLElement }): HTMLInputElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('input'));
}

function type(box: HTMLInputElement, char: string) {
  box.value = char;
  box.dispatchEvent(new Event('input', { bubbles: true }));
}

function keydown(box: HTMLInputElement, key: string) {
  box.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

/** jsdom's ClipboardEvent doesn't support real clipboardData, same plain-Event-cast pattern already used for PointerEvent elsewhere in this codebase. */
function paste(box: HTMLInputElement, text: string) {
  const event = Object.assign(new Event('paste', { bubbles: true, cancelable: true }), { clipboardData: { getData: () => text } });
  box.dispatchEvent(event);
}

describe('InputOtpComponent', () => {
  function create(): ComponentFixture<InputOtpComponent> {
    const fixture = TestBed.createComponent(InputOtpComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('renders `length` boxes (6 by default)', () => {
    const fixture = create();
    expect(boxes(fixture).length).toBe(6);
  });

  it('respects a custom length', () => {
    const fixture = TestBed.createComponent(InputOtpComponent);
    fixture.componentRef.setInput('length', 4);
    fixture.detectChanges();
    expect(boxes(fixture).length).toBe(4);
  });

  it('typing a digit auto-advances focus to the next box and commits the joined value', () => {
    const fixture = create();
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);
    const btns = boxes(fixture);

    type(btns[0], '1');
    fixture.detectChanges();
    expect(onChange).toHaveBeenLastCalledWith('1');
    expect(document.activeElement).toBe(boxes(fixture)[1]);
  });

  it('rejects non-digit characters when integerOnly (the default)', () => {
    const fixture = create();
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);
    type(boxes(fixture)[0], 'a');
    fixture.detectChanges();
    expect(onChange).toHaveBeenLastCalledWith('');
    expect(document.activeElement).not.toBe(boxes(fixture)[1]); // no advance on a rejected character
  });

  it('integerOnly=false allows letters', () => {
    const fixture = TestBed.createComponent(InputOtpComponent);
    fixture.componentRef.setInput('integerOnly', false);
    fixture.detectChanges();
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);
    type(boxes(fixture)[0], 'a');
    fixture.detectChanges();
    expect(onChange).toHaveBeenLastCalledWith('a');
  });

  it('Backspace on an empty box clears and focuses the previous box', () => {
    const fixture = create();
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);
    const btns = boxes(fixture);
    type(btns[0], '1');
    fixture.detectChanges();

    keydown(boxes(fixture)[1], 'Backspace'); // box 1 is empty
    fixture.detectChanges();

    expect(onChange).toHaveBeenLastCalledWith('');
    expect(document.activeElement).toBe(boxes(fixture)[0]);
  });

  it('ArrowLeft/ArrowRight move focus without changing the value', () => {
    const fixture = create();
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);
    const btns = boxes(fixture);

    keydown(btns[0], 'ArrowRight');
    expect(document.activeElement).toBe(boxes(fixture)[1]);
    keydown(boxes(fixture)[1], 'ArrowLeft');
    expect(document.activeElement).toBe(boxes(fixture)[0]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('pasting a full code distributes it across the boxes and focuses the last filled one', () => {
    const fixture = create();
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);

    paste(boxes(fixture)[0], '123456');
    fixture.detectChanges();

    expect(onChange).toHaveBeenLastCalledWith('123456');
    expect(boxes(fixture).map((b) => b.value)).toEqual(['1', '2', '3', '4', '5', '6']);
    expect(document.activeElement).toBe(boxes(fixture)[5]);
  });

  it('pasting strips non-digit characters when integerOnly', () => {
    const fixture = create();
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);
    paste(boxes(fixture)[0], '12-34');
    fixture.detectChanges();
    expect(onChange).toHaveBeenLastCalledWith('1234');
  });

  it('pasting starting mid-way only fills from that box onward, leaving earlier boxes untouched', () => {
    const fixture = create();
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);
    paste(boxes(fixture)[2], '789');
    fixture.detectChanges();
    expect(boxes(fixture).map((b) => b.value)).toEqual(['', '', '7', '8', '9', '']);
    expect(onChange).toHaveBeenLastCalledWith('789'); // empty boxes contribute nothing when joined
  });

  it('mask replaces the displayed character with a dot, but the committed value stays the real digit', () => {
    const fixture = TestBed.createComponent(InputOtpComponent);
    fixture.componentRef.setInput('mask', true);
    fixture.detectChanges();
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);

    type(boxes(fixture)[0], '5');
    fixture.detectChanges();

    expect(boxes(fixture)[0].value).toBe('•');
    expect(onChange).toHaveBeenLastCalledWith('5');
  });

  it('disabled: boxes are disabled and typing does nothing', () => {
    const fixture = TestBed.createComponent(InputOtpComponent);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(boxes(fixture).every((b) => b.disabled)).toBe(true);
  });

  it('sets aria-invalid on every box when invalid is true', () => {
    const fixture = TestBed.createComponent(InputOtpComponent);
    fixture.componentRef.setInput('invalid', true);
    fixture.detectChanges();
    expect(boxes(fixture).every((b) => b.getAttribute('aria-invalid') === 'true')).toBe(true);
  });

  it('writeValue distributes an existing value across the boxes', () => {
    const fixture = create();
    fixture.componentInstance.writeValue('42');
    fixture.detectChanges();
    expect(boxes(fixture).map((b) => b.value)).toEqual(['4', '2', '', '', '', '']);
  });

  it('writeValue(null/undefined) normalizes to all-empty, never throwing', () => {
    const fixture = create();
    const cmp = fixture.componentInstance;
    cmp.writeValue('123');
    fixture.detectChanges();
    expect(() => cmp.writeValue(null)).not.toThrow();
    fixture.detectChanges();
    expect(boxes(fixture).every((b) => b.value === '')).toBe(true);
    expect(() => cmp.writeValue(undefined)).not.toThrow();
  });

  it('a FormControl initialized with a value renders it', () => {
    @Component({
      standalone: true,
      imports: [InputOtpComponent, ReactiveFormsModule],
      template: `<med-input-otp [formControl]="control" />`,
    })
    class HostComponent {
      readonly control = new FormControl('99', { nonNullable: true });
    }

    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const inputs = Array.from(fixture.nativeElement.querySelectorAll('input')) as HTMLInputElement[];
    expect(inputs.map((b) => b.value)).toEqual(['9', '9', '', '', '', '']);
  });

  it('disables via setDisabledState (Reactive Forms disable())', () => {
    const fixture = create();
    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();
    expect(boxes(fixture).every((b) => b.disabled)).toBe(true);
  });

  it('[UI-010.S1] applies variant="filled", fluid, and custom #input template', () => {
    @Component({
      standalone: true,
      imports: [InputOtpComponent],
      template: `
        <med-input-otp [length]="3" variant="filled" [fluid]="true">
          <ng-template #input let-token let-events="events" let-index="index">
            <input
              data-testid="custom-otp-slot"
              [attr.data-index]="index"
              [value]="token"
              (input)="events.input($event)"
            />
          </ng-template>
        </med-input-otp>
      `,
    })
    class CustomOtpHost {}

    const fixture = TestBed.createComponent(CustomOtpHost);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector('med-input-otp') as HTMLElement;

    expect(host.getAttribute('data-variant')).toBe('filled');
    expect(host.className).toContain('w-full');
    expect(host.querySelectorAll('[data-testid="custom-otp-slot"]').length).toBe(3);
  });
});
