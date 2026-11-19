import { Directive, HostListener, booleanAttribute, input } from '@angular/core';

/**
 * Built-in linear character-class filter presets.
 */
export type KeyFilterPattern =
  | 'pint'
  | 'int'
  | 'pnum'
  | 'num'
  | 'hex'
  | 'email'
  | 'alpha'
  | 'alphanum';

const MAX_FILTER_LENGTH = 4096;

const KEY_FILTER_PRESETS: Record<KeyFilterPattern, RegExp> = {
  pint: /[0-9]/,
  int: /[0-9\-]/,
  pnum: /[0-9.]/,
  num: /[0-9.\-]/,
  hex: /[0-9a-fA-F]/,
  email: /[a-zA-Z0-9._%+\-@]/,
  alpha: /[a-zA-Z_]/,
  alphanum: /[a-zA-Z0-9_]/,
};

/**
 * Restricts or validates input characters based on a built-in preset or custom RegExp.
 *
 * Security note: KeyFilter is a client-side UX convenience only and MUST NOT replace
 * server-side validation. Custom `RegExp` values should use simple linear character classes
 * and avoid nested quantifiers to prevent ReDoS.
 */
@Directive({
  selector: '[medKeyFilter]',
  standalone: true,
})
export class KeyFilterDirective {
  /** Filter preset name or custom regular expression tested per character. */
  readonly medKeyFilter = input<KeyFilterPattern | RegExp>('alphanum');
  /** When true, allows typing freely and leaves validation to explicit `validate()` checks. */
  readonly validateOnly = input(false, { transform: booleanAttribute });

  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent): void {
    if (this.validateOnly() || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    if (event.key.length !== 1) {
      return;
    }

    if (!this.isCharAllowed(event.key)) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    if (this.validateOnly()) {
      return;
    }

    const pasted = event.clipboardData?.getData('text') ?? '';
    if (!this.validate(pasted)) {
      event.preventDefault();
    }
  }

  /**
   * Validates an entire string against the active filter pattern within safe length bounds.
   */
  validate(value: string): boolean {
    if (value.length > MAX_FILTER_LENGTH) {
      return false;
    }

    const regex = this.resolveRegex();
    for (let i = 0; i < value.length; i += 1) {
      if (!regex.test(value[i])) {
        return false;
      }
    }
    return true;
  }

  private isCharAllowed(char: string): boolean {
    return this.resolveRegex().test(char);
  }

  private resolveRegex(): RegExp {
    const filter = this.medKeyFilter();
    if (typeof filter === 'string') {
      return KEY_FILTER_PRESETS[filter] ?? KEY_FILTER_PRESETS.alphanum;
    }
    const flags = filter.flags.replace(/g/g, '');
    return new RegExp(filter.source, flags);
  }
}

export const KeyFilter = KeyFilterDirective;
