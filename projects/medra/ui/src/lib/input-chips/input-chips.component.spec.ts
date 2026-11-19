import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputChipsComponent } from './input-chips.component';

function nativeInput(fixture: { nativeElement: HTMLElement }): HTMLInputElement {
  return fixture.nativeElement.querySelector('input') as HTMLInputElement;
}

function chipLabels(fixture: { nativeElement: HTMLElement }): string[] {
  return Array.from(fixture.nativeElement.querySelectorAll('med-chip')).map((el) => el.textContent?.trim() ?? '');
}

// Also runs change detection, mirroring the real app: Angular's zoneless
// scheduler would have already flushed a pass between keystrokes and a
// later Enter, so its own bookkeeping of the `[value]` binding's last
// value reflects the typed text by the time Enter fires — without this,
// committing back to '' looks like a no-op change to Angular (still ''
// from its last-known state before this helper ran) and the DOM write
// never happens, even though the underlying signal is correct.
function type(fixture: ComponentFixture<InputChipsComponent>, input: HTMLInputElement, text: string) {
  input.value = text;
  input.dispatchEvent(new Event('input'));
  fixture.detectChanges();
}

function keydown(el: HTMLElement, key: string) {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

describe('InputChipsComponent', () => {
  function create(): ComponentFixture<InputChipsComponent> {
    const fixture = TestBed.createComponent(InputChipsComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('starts empty, showing the placeholder', () => {
    const fixture = create();
    fixture.componentRef.setInput('placeholder', 'Add a tag...');
    fixture.detectChanges();
    expect(chipLabels(fixture)).toEqual([]);
    expect(nativeInput(fixture).placeholder).toBe('Add a tag...');
  });

  it('pressing Enter commits the typed text as a chip and clears the input', () => {
    const fixture = create();
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);
    const input = nativeInput(fixture);

    type(fixture, input, 'angular');
    keydown(input, 'Enter');
    fixture.detectChanges();

    expect(chipLabels(fixture)).toEqual(['angular']);
    expect(onChange).toHaveBeenCalledWith(['angular']);
    expect(input.value).toBe('');
  });

  describe('addOnTab', () => {
    it('Tab commits the draft as a chip when addOnTab is true, without preventing the default Tab behavior', () => {
      const fixture = create();
      fixture.componentRef.setInput('addOnTab', true);
      fixture.detectChanges();
      const onChange = jest.fn();
      fixture.componentInstance.registerOnChange(onChange);
      const input = nativeInput(fixture);

      type(fixture, input, 'angular');
      const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
      input.dispatchEvent(event);
      fixture.detectChanges();

      expect(chipLabels(fixture)).toEqual(['angular']);
      expect(onChange).toHaveBeenCalledWith(['angular']);
      expect(event.defaultPrevented).toBe(false);
    });

    it('Tab with an empty draft does nothing, even when addOnTab is true', () => {
      const fixture = create();
      fixture.componentRef.setInput('addOnTab', true);
      fixture.detectChanges();
      const input = nativeInput(fixture);

      keydown(input, 'Tab');
      fixture.detectChanges();

      expect(chipLabels(fixture)).toEqual([]);
    });

    it('Tab never commits when addOnTab is false (default)', () => {
      const fixture = create();
      const input = nativeInput(fixture);

      type(fixture, input, 'angular');
      keydown(input, 'Tab');
      fixture.detectChanges();

      expect(chipLabels(fixture)).toEqual([]);
      expect(input.value).toBe('angular');
    });

    it('follows the same rules as Enter — a duplicate is a no-op, text stays', () => {
      const fixture = create();
      fixture.componentRef.setInput('addOnTab', true);
      fixture.componentInstance.writeValue(['angular']);
      fixture.detectChanges();
      const input = nativeInput(fixture);

      type(fixture, input, 'angular');
      keydown(input, 'Tab');
      fixture.detectChanges();

      expect(chipLabels(fixture)).toEqual(['angular']);
      expect(input.value).toBe('angular');
    });
  });

  it('trims whitespace and ignores an empty/whitespace-only entry', () => {
    const fixture = create();
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);
    const input = nativeInput(fixture);

    type(fixture, input, '  tailwind  ');
    keydown(input, 'Enter');
    fixture.detectChanges();
    expect(chipLabels(fixture)).toEqual(['tailwind']);

    type(fixture, input, '   ');
    keydown(input, 'Enter');
    fixture.detectChanges();
    expect(chipLabels(fixture)).toEqual(['tailwind']);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('Backspace on an empty input removes the last chip', () => {
    const fixture = create();
    fixture.componentInstance.writeValue(['one', 'two', 'three']);
    fixture.detectChanges();
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);

    keydown(nativeInput(fixture), 'Backspace');
    fixture.detectChanges();

    expect(chipLabels(fixture)).toEqual(['one', 'two']);
    expect(onChange).toHaveBeenCalledWith(['one', 'two']);
  });

  it('Backspace with text still in the input does not remove a chip', () => {
    const fixture = create();
    fixture.componentInstance.writeValue(['one']);
    fixture.detectChanges();
    const input = nativeInput(fixture);
    type(fixture, input, 'a');

    keydown(input, 'Backspace');
    fixture.detectChanges();

    expect(chipLabels(fixture)).toEqual(['one']);
  });

  it("clicking each chip's remove button removes just that one", () => {
    const fixture = create();
    fixture.componentInstance.writeValue(['a', 'b', 'c']);
    fixture.detectChanges();

    const removeButtons = Array.from(fixture.nativeElement.querySelectorAll('med-chip button')) as HTMLButtonElement[];
    removeButtons[1].click();
    fixture.detectChanges();

    expect(chipLabels(fixture)).toEqual(['a', 'c']);
  });

  it('rejects duplicates by default (Enter is a no-op, text stays)', () => {
    const fixture = create();
    fixture.componentInstance.writeValue(['angular']);
    fixture.detectChanges();
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);
    const input = nativeInput(fixture);

    type(fixture, input, 'angular');
    keydown(input, 'Enter');
    fixture.detectChanges();

    expect(chipLabels(fixture)).toEqual(['angular']);
    expect(onChange).not.toHaveBeenCalled();
    expect(input.value).toBe('angular');
  });

  it('allowDuplicates permits a repeated entry', () => {
    const fixture = create();
    fixture.componentRef.setInput('allowDuplicates', true);
    fixture.componentInstance.writeValue(['angular']);
    fixture.detectChanges();
    const input = nativeInput(fixture);

    type(fixture, input, 'angular');
    keydown(input, 'Enter');
    fixture.detectChanges();

    expect(chipLabels(fixture)).toEqual(['angular', 'angular']);
  });

  it('max caps the number of chips; Enter beyond it is a no-op', () => {
    const fixture = create();
    fixture.componentRef.setInput('max', 2);
    fixture.componentInstance.writeValue(['a', 'b']);
    fixture.detectChanges();
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);
    const input = nativeInput(fixture);

    type(fixture, input, 'c');
    keydown(input, 'Enter');
    fixture.detectChanges();

    expect(chipLabels(fixture)).toEqual(['a', 'b']);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('disabled: the input is disabled and Enter/Backspace are no-ops', () => {
    const fixture = create();
    fixture.componentInstance.writeValue(['a']);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const input = nativeInput(fixture);
    expect(input.disabled).toBe(true);

    keydown(input, 'Backspace');
    fixture.detectChanges();
    expect(chipLabels(fixture)).toEqual(['a']);
  });

  it('disables via setDisabledState (Reactive Forms disable())', () => {
    const fixture = create();
    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();
    expect(nativeInput(fixture).disabled).toBe(true);
  });

  it('sets aria-invalid when invalid is true', () => {
    const fixture = create();
    fixture.componentRef.setInput('invalid', true);
    fixture.detectChanges();
    expect(nativeInput(fixture).getAttribute('aria-invalid')).toBe('true');
  });

  it('sets aria-label from ariaLabel', () => {
    const fixture = create();
    fixture.componentRef.setInput('ariaLabel', 'Tags');
    fixture.detectChanges();
    expect(nativeInput(fixture).getAttribute('aria-label')).toBe('Tags');
  });

  it('writeValue(null/undefined) normalizes to an empty list, never throwing', () => {
    const fixture = create();
    const cmp = fixture.componentInstance;
    cmp.writeValue(['a']);
    fixture.detectChanges();
    expect(chipLabels(fixture)).toEqual(['a']);

    expect(() => cmp.writeValue(null)).not.toThrow();
    fixture.detectChanges();
    expect(chipLabels(fixture)).toEqual([]);

    expect(() => cmp.writeValue(undefined)).not.toThrow();
    fixture.detectChanges();
    expect(chipLabels(fixture)).toEqual([]);
  });

  it('a FormControl initialized with a value renders it', () => {
    @Component({
      standalone: true,
      imports: [InputChipsComponent, ReactiveFormsModule],
      template: `<med-input-chips [formControl]="control" />`,
    })
    class HostComponent {
      readonly control = new FormControl<string[]>(['x', 'y'], { nonNullable: true });
    }

    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(chipLabels(fixture)).toEqual(['x', 'y']);
  });

  it('clicking the wrapper focuses the input', () => {
    const fixture = create();
    const wrapper = fixture.nativeElement.querySelector('div') as HTMLElement;
    wrapper.click();
    expect(document.activeElement).toBe(nativeInput(fixture));
  });

  function removeButtons(fixture: { nativeElement: HTMLElement }): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('med-chip button'));
  }

  describe('aria-live announcements (Wave 2 fix)', () => {
    it('announces a commit', () => {
      const fixture = create();
      const input = nativeInput(fixture);
      type(fixture, input, 'angular');
      keydown(input, 'Enter');
      fixture.detectChanges();

      const live = fixture.nativeElement.querySelector('[aria-live="polite"]') as HTMLElement;
      expect(live.textContent).toContain('Added angular');
    });

    it('announces a removal', () => {
      const fixture = create();
      fixture.componentInstance.writeValue(['one', 'two']);
      fixture.detectChanges();

      keydown(nativeInput(fixture), 'Backspace');
      fixture.detectChanges();

      const live = fixture.nativeElement.querySelector('[aria-live="polite"]') as HTMLElement;
      expect(live.textContent).toContain('Removed two');
    });
  });

  describe('keyboard path to remove a non-last chip (Wave 2 fix)', () => {
    it('ArrowLeft from an empty input moves focus onto the last chip\'s remove button', () => {
      const fixture = create();
      fixture.componentInstance.writeValue(['one', 'two', 'three']);
      fixture.detectChanges();

      keydown(nativeInput(fixture), 'ArrowLeft');
      fixture.detectChanges();

      expect(document.activeElement).toBe(removeButtons(fixture)[2]);
    });

    it('ArrowLeft/ArrowRight rove focus between chips, and ArrowRight off the last chip returns to the input', () => {
      const fixture = create();
      fixture.componentInstance.writeValue(['one', 'two', 'three']);
      fixture.detectChanges();
      const buttons = removeButtons(fixture);

      buttons[2].focus();
      keydown(buttons[2], 'ArrowLeft');
      fixture.detectChanges();
      expect(document.activeElement).toBe(removeButtons(fixture)[1]);

      keydown(removeButtons(fixture)[1], 'ArrowRight');
      keydown(removeButtons(fixture)[2], 'ArrowRight');
      fixture.detectChanges();
      expect(document.activeElement).toBe(nativeInput(fixture));
    });

    it('Backspace on a focused, non-last chip removes just that one and keeps focus among the chips', () => {
      const fixture = create();
      const onChange = jest.fn();
      fixture.componentInstance.writeValue(['one', 'two', 'three']);
      fixture.detectChanges();
      fixture.componentInstance.registerOnChange(onChange);

      const middleButton = removeButtons(fixture)[1]; // "two"
      middleButton.focus();
      keydown(middleButton, 'Backspace');
      fixture.detectChanges();

      expect(chipLabels(fixture)).toEqual(['one', 'three']);
      expect(onChange).toHaveBeenCalledWith(['one', 'three']);
      // "three" shifted into index 1, the slot the removed chip vacated —
      // focus should land there, not snap back to the text input.
      expect(document.activeElement).toBe(removeButtons(fixture)[1]);
    });

    it('Delete removes the last remaining chip and returns focus to the input', () => {
      const fixture = create();
      fixture.componentInstance.writeValue(['solo']);
      fixture.detectChanges();

      const button = removeButtons(fixture)[0];
      button.focus();
      keydown(button, 'Delete');
      fixture.detectChanges();

      expect(chipLabels(fixture)).toEqual([]);
      expect(document.activeElement).toBe(nativeInput(fixture));
    });

    it('disabled: Backspace on a focused chip is a no-op', () => {
      const fixture = create();
      fixture.componentInstance.writeValue(['one', 'two']);
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const button = removeButtons(fixture)[0];
      keydown(button, 'Backspace');
      fixture.detectChanges();

      expect(chipLabels(fixture)).toEqual(['one', 'two']);
    });
  });

  it('[UI-010.S2] splits typed or pasted tokens by separator', () => {
    const fixture = TestBed.createComponent(InputChipsComponent);
    fixture.componentRef.setInput('separator', ',');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'alpha,beta,gamma';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(chipLabels(fixture)).toEqual(['alpha', 'beta', 'gamma']);
  });
});
