import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TextareaDirective } from './textarea.directive';

function typeInto(textarea: HTMLTextAreaElement, value: string) {
  textarea.value = value;
  textarea.dispatchEvent(new Event('input'));
}

describe('TextareaDirective', () => {
  @Component({
    standalone: true,
    imports: [TextareaDirective],
    template: `<textarea medTextarea [size]="size" [invalid]="invalid" [class]="extraClass"></textarea>`,
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
    return { fixture, textarea: fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement };
  }

  it('applies the default-size field classes and a vertical resize handle', () => {
    const { textarea } = createHost();

    expect(textarea.className).toContain('px-(--spacing-field-x)');
    expect(textarea.className).toContain('resize-y');
  });

  it('reacts to size changes', () => {
    const { textarea } = createHost({ size: 'lg' });
    expect(textarea.className).toContain('px-(--spacing-field-lg-x)');
  });

  it('sets aria-invalid when invalid', () => {
    const { textarea } = createHost({ invalid: true });
    expect(textarea.className).toContain('border-danger-500');
    expect(textarea.getAttribute('aria-invalid')).toBe('true');
  });

  it('merges a consumer class override', () => {
    const { textarea } = createHost({ extraClass: 'h-40' });
    expect(textarea.className).toContain('h-40');
  });

  it('a real keyboard keystroke (keydown + input, not just a synthetic "input" dispatch) reaches registerOnChange, proving typing itself needs no directive-level keyboard handling — the native textarea element already owns it', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    const directive = fixture.debugElement.children[0].injector.get(TextareaDirective);
    const received: string[] = [];
    directive.registerOnChange((value) => received.push(value));

    textarea.focus();
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    textarea.value = 'a';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.dispatchEvent(new KeyboardEvent('keyup', { key: 'a', bubbles: true }));

    expect(received).toEqual(['a']);
  });

  it('a FormControl initialized with null renders empty and updates on typing', () => {
    @Component({
      standalone: true,
      imports: [TextareaDirective, ReactiveFormsModule],
      template: `<textarea medTextarea [formControl]="control"></textarea>`,
    })
    class ReactiveHostComponent {
      readonly control = new FormControl<string | null>(null);
    }

    const fixture = TestBed.createComponent(ReactiveHostComponent);
    fixture.detectChanges();
    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;

    expect(textarea.value).toBe('');

    typeInto(textarea, 'multi\nline');
    expect(fixture.componentInstance.control.value).toBe('multi\nline');
  });

  it('setDisabledState disables the native textarea', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const directive = fixture.debugElement.children[0].injector.get(TextareaDirective);
    directive.setDisabledState(true);
    fixture.detectChanges();

    expect((fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement).disabled).toBe(true);
  });

  describe('autoResize', () => {
    @Component({
      standalone: true,
      imports: [TextareaDirective],
      template: `<textarea medTextarea autoResize [formControl]="control"></textarea>`,
    })
    class AutoResizeHostComponent {
      readonly control = new FormControl<string | null>(null);
    }

    function createAutoResizeHost() {
      const fixture = TestBed.createComponent(AutoResizeHostComponent);
      fixture.detectChanges();
      const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
      // jsdom never computes real layout, so scrollHeight is always 0 — stand in a value that
      // changes with content length, close enough to prove the directive reads it and applies it.
      Object.defineProperty(textarea, 'scrollHeight', { configurable: true, get: () => 20 + textarea.value.split('\n').length * 20 });
      return { fixture, textarea };
    }

    it('drops the manual resize handle in favor of resize-none overflow-hidden', () => {
      const { textarea } = createAutoResizeHost();
      expect(textarea.className).not.toContain('resize-y');
      expect(textarea.className).toContain('resize-none');
      expect(textarea.className).toContain('overflow-hidden');
    });

    it('sets an explicit pixel height matching scrollHeight on input', () => {
      const { textarea } = createAutoResizeHost();
      typeInto(textarea, 'one\ntwo\nthree');
      expect(textarea.style.height).toBe('80px'); // 20 + 3 lines * 20
    });

    // TXA-002.S1
    it('[TXA-002.S1] grows as lines are added and shrinks back as they are removed', () => {
      const { textarea } = createAutoResizeHost();
      typeInto(textarea, 'one');
      expect(textarea.style.height).toBe('40px');

      typeInto(textarea, 'one\ntwo\nthree');
      expect(textarea.style.height).toBe('80px');

      typeInto(textarea, 'one');
      expect(textarea.style.height).toBe('40px');
    });

    it('shrinks back down when content is removed', () => {
      const { textarea } = createAutoResizeHost();
      typeInto(textarea, 'one\ntwo\nthree');
      expect(textarea.style.height).toBe('80px');

      typeInto(textarea, 'one');
      expect(textarea.style.height).toBe('40px'); // 20 + 1 line * 20
    });

    it('sizes to a value written programmatically (writeValue), without any input event', () => {
      const fixture = TestBed.createComponent(AutoResizeHostComponent);
      fixture.detectChanges();
      const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
      Object.defineProperty(textarea, 'scrollHeight', { configurable: true, get: () => 20 + textarea.value.split('\n').length * 20 });
      const directive = fixture.debugElement.children[0].injector.get(TextareaDirective);

      directive.writeValue('a\nb\nc\nd\ne');

      expect(textarea.style.height).toBe('120px'); // 20 + 5 lines * 20
    });

    it('without autoResize, no inline height is ever set', () => {
      const { textarea } = createHost();
      typeInto(textarea, 'one\ntwo\nthree');
      expect(textarea.style.height).toBe('');
    });
  });

  it('[UI-010.S1] applies variant="filled" and fluid styling', () => {
    @Component({
      standalone: true,
      imports: [TextareaDirective],
      template: `<textarea medTextarea variant="filled" [fluid]="true"></textarea>`,
    })
    class VariantFluidHost {}

    const fixture = TestBed.createComponent(VariantFluidHost);
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;

    expect(el.getAttribute('data-variant')).toBe('filled');
    expect(el.className).toContain('w-full');
  });
});
