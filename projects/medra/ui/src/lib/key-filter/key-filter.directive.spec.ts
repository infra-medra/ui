import { Component, ViewChild, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KeyFilterDirective, KeyFilterPattern } from './key-filter.directive';

@Component({
  standalone: true,
  imports: [KeyFilterDirective],
  template: `
    <input
      [medKeyFilter]="pattern()"
      [validateOnly]="validateOnly()"
      data-testid="kf-input"
    />
  `,
})
class KeyFilterHostComponent {
  readonly pattern = signal<KeyFilterPattern | RegExp>('pint');
  readonly validateOnly = signal(false);

  @ViewChild(KeyFilterDirective) directive!: KeyFilterDirective;
}

describe('KeyFilterDirective (UI-012.S4)', () => {
  it('allows matching characters, blocks non-matching characters, and preserves control/shortcut keys (M-01, M-03)', () => {
    TestBed.configureTestingModule({
      imports: [KeyFilterHostComponent],
    });
    const fixture = TestBed.createComponent(KeyFilterHostComponent);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('[data-testid="kf-input"]') as HTMLInputElement;

    const validKeyEvent = new KeyboardEvent('keypress', { key: '5', cancelable: true });
    input.dispatchEvent(validKeyEvent);
    expect(validKeyEvent.defaultPrevented).toBe(false);

    const invalidKeyEvent = new KeyboardEvent('keypress', { key: 'a', cancelable: true });
    input.dispatchEvent(invalidKeyEvent);
    expect(invalidKeyEvent.defaultPrevented).toBe(true);

    // Control / navigation keys remain allowed
    const backspaceEvent = new KeyboardEvent('keydown', { key: 'Backspace', cancelable: true });
    input.dispatchEvent(backspaceEvent);
    expect(backspaceEvent.defaultPrevented).toBe(false);

    // Shortcut keys (Ctrl/Meta/Alt) remain allowed
    const ctrlVEvent = new KeyboardEvent('keypress', { key: 'v', ctrlKey: true, cancelable: true });
    input.dispatchEvent(ctrlVEvent);
    expect(ctrlVEvent.defaultPrevented).toBe(false);
  });

  it('supports built-in linear presets and custom RegExp patterns (M-01)', () => {
    TestBed.configureTestingModule({
      imports: [KeyFilterHostComponent],
    });
    const fixture = TestBed.createComponent(KeyFilterHostComponent);
    fixture.detectChanges();

    const { directive } = fixture.componentInstance;

    expect(directive.validate('12345')).toBe(true);
    expect(directive.validate('12a')).toBe(false);

    fixture.componentInstance.pattern.set('alpha');
    fixture.detectChanges();
    expect(directive.validate('abcXYZ')).toBe(true);
    expect(directive.validate('abc1')).toBe(false);

    fixture.componentInstance.pattern.set('hex');
    fixture.detectChanges();
    expect(directive.validate('0aFf9')).toBe(true);
    expect(directive.validate('0g')).toBe(false);

    fixture.componentInstance.pattern.set(/[A-Z_]/);
    fixture.detectChanges();
    expect(directive.validate('HELLO_WORLD')).toBe(true);
    expect(directive.validate('hello')).toBe(false);
  });

  it('filters invalid clipboard paste payloads and bounds oversized payloads (M-02, M-03)', () => {
    TestBed.configureTestingModule({
      imports: [KeyFilterHostComponent],
    });
    const fixture = TestBed.createComponent(KeyFilterHostComponent);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('[data-testid="kf-input"]') as HTMLInputElement;
    const { directive } = fixture.componentInstance;

    const createPasteEvent = (text: string): Event => {
      const event = new Event('paste', { cancelable: true }) as Event & {
        clipboardData?: { getData: (type: string) => string };
      };
      event.clipboardData = {
        getData: () => text,
      };
      return event;
    };

    const invalidPaste = createPasteEvent('12abc');
    input.dispatchEvent(invalidPaste);
    expect(invalidPaste.defaultPrevented).toBe(true);

    const validPaste = createPasteEvent('98765');
    input.dispatchEvent(validPaste);
    expect(validPaste.defaultPrevented).toBe(false);

    // Oversized payload is rejected safely without catastrophic backtracking
    const oversized = '1'.repeat(10000);
    expect(directive.validate(oversized)).toBe(false);
    const oversizedPaste = createPasteEvent(oversized);
    input.dispatchEvent(oversizedPaste);
    expect(oversizedPaste.defaultPrevented).toBe(true);
  });

  it('validates whole value without blocking keystrokes when validateOnly=true', () => {
    TestBed.configureTestingModule({
      imports: [KeyFilterHostComponent],
    });
    const fixture = TestBed.createComponent(KeyFilterHostComponent);
    fixture.componentInstance.validateOnly.set(true);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('[data-testid="kf-input"]') as HTMLInputElement;
    const keyEvent = new KeyboardEvent('keypress', { key: 'x', cancelable: true });
    input.dispatchEvent(keyEvent);
    expect(keyEvent.defaultPrevented).toBe(false);
  });
});
