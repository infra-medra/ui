import {
  DestroyRef,
  Directive,
  ElementRef,
  Renderer2,
  SecurityContext,
  effect,
  inject,
  input,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

/** Map of attributes, classes, styles, and event handlers for BindDirective. */
export type BindMap = Record<string, unknown>;

const BLOCKED_KEYS = new Set([
  '__proto__',
  'constructor',
  'prototype',
  'innerhtml',
  'outerhtml',
  'srcdoc',
  'insertadjacenthtml',
]);

const URL_ATTRIBUTES = new Set(['href', 'xlink:href', 'src', 'action', 'formaction']);
const SAFE_URL_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);

/**
 * Declaratively binds sanitized attributes, classes, styles, and event listeners
 * to the host element while blocking dangerous HTML/script sinks and unsafe URLs.
 */
@Directive({
  selector: '[medBind]',
  standalone: true,
})
export class BindDirective {
  readonly medBind = input<BindMap | null | undefined>(undefined);

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly destroyRef = inject(DestroyRef);

  private appliedAttrs = new Set<string>();
  private appliedStyles = new Set<string>();
  private appliedClasses: string[] = [];
  private unlistenFns: Array<() => void> = [];

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.clearListeners();
    });

    effect(() => {
      const bindings = this.medBind();
      this.clearPrevious();
      if (!bindings || typeof bindings !== 'object') {
        return;
      }
      this.applyBindings(bindings);
    });
  }

  private applyBindings(bindings: BindMap): void {
    const host = this.el.nativeElement;

    for (const key of Object.keys(bindings)) {
      const lowerKey = key.toLowerCase();
      if (BLOCKED_KEYS.has(lowerKey)) {
        continue;
      }

      const value = bindings[key];

      if (lowerKey.startsWith('on') && key.length > 2) {
        if (typeof value === 'function') {
          const eventName = lowerKey.slice(2);
          this.unlistenFns.push(
            this.renderer.listen(host, eventName, value as (event: Event) => boolean | void),
          );
        }
        continue;
      }

      if (lowerKey === 'class') {
        this.applyClasses(host, value);
        continue;
      }

      if (lowerKey === 'style') {
        this.applyStyles(host, value);
        continue;
      }

      if (value === null || value === undefined || value === false) {
        continue;
      }

      const stringValue = value === true ? '' : String(value);

      if (URL_ATTRIBUTES.has(lowerKey) && !this.isSafeUrl(stringValue)) {
        continue;
      }

      this.renderer.setAttribute(host, lowerKey, stringValue);
      this.appliedAttrs.add(lowerKey);
    }
  }

  private applyClasses(host: HTMLElement, value: unknown): void {
    const classes: string[] = [];
    if (typeof value === 'string') {
      classes.push(...value.trim().split(/\s+/).filter(Boolean));
    } else if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'string' && item.trim()) {
          classes.push(...item.trim().split(/\s+/).filter(Boolean));
        }
      }
    } else if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>;
      for (const cls of Object.keys(record)) {
        if (!BLOCKED_KEYS.has(cls.toLowerCase()) && record[cls]) {
          classes.push(cls);
        }
      }
    }

    for (const cls of classes) {
      this.renderer.addClass(host, cls);
      this.appliedClasses.push(cls);
    }
  }

  private applyStyles(host: HTMLElement, value: unknown): void {
    if (!value || typeof value !== 'object') {
      return;
    }
    const styles = value as Record<string, unknown>;
    for (const prop of Object.keys(styles)) {
      if (BLOCKED_KEYS.has(prop.toLowerCase())) {
        continue;
      }
      const styleVal = styles[prop];
      if (styleVal !== null && styleVal !== undefined) {
        this.renderer.setStyle(host, prop, String(styleVal));
        this.appliedStyles.add(prop);
      }
    }
  }

  private isSafeUrl(raw: string): boolean {
    const trimmed = raw.trim();
    if (!trimmed || /[\u0000-\u001F\u007F]/.test(trimmed)) {
      return false;
    }

    const schemeMatch = /^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(trimmed);
    if (schemeMatch) {
      const protocol = `${schemeMatch[1].toLowerCase()}:`;
      if (!SAFE_URL_PROTOCOLS.has(protocol)) {
        return false;
      }
    }

    const sanitized = this.sanitizer.sanitize(SecurityContext.URL, trimmed);
    return sanitized !== null && !sanitized.startsWith('unsafe:');
  }

  private clearPrevious(): void {
    const host = this.el.nativeElement;
    this.clearListeners();

    for (const attr of this.appliedAttrs) {
      this.renderer.removeAttribute(host, attr);
    }
    this.appliedAttrs.clear();

    for (const prop of this.appliedStyles) {
      this.renderer.removeStyle(host, prop);
    }
    this.appliedStyles.clear();

    for (const cls of this.appliedClasses) {
      this.renderer.removeClass(host, cls);
    }
    this.appliedClasses = [];
  }

  private clearListeners(): void {
    for (const unlisten of this.unlistenFns) {
      unlisten();
    }
    this.unlistenFns = [];
  }
}
