import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ButtonDirective } from './button.directive';

@Component({
  standalone: true,
  imports: [ButtonDirective],
  template: `
    <button
      #host
      medButton
      type="button"
      [severity]="severity"
      [variant]="variant"
      [size]="size"
      [pill]="pill"
      [iconOnly]="iconOnly"
      [class]="extraClass"
      [medRippleDisabled]="rippleDisabled"
      [disabled]="disabled"
      [invalid]="invalid"
      [loading]="loading"
      [raised]="raised"
      [plain]="plain"
      [badge]="badge()"
      [badgeSeverity]="badgeSeverity"
      [fluid]="fluid"
      (click)="onClick()"
    >
      Save
    </button>
  `,
})
class HostComponent {
  readonly host = viewChild.required<ElementRef<HTMLButtonElement>>('host');
  severity: 'primary' | 'secondary' | 'info' | 'success' | 'warn' | 'help' | 'danger' | 'contrast' = 'primary';
  variant: 'filled' | 'outlined' | 'text' | 'link' = 'filled';
  size: 'sm' | 'default' | 'lg' = 'default';
  pill = false;
  iconOnly = false;
  extraClass = '';
  rippleDisabled = false;
  disabled = false;
  invalid = false;
  loading = false;
  raised = false;
  plain = false;
  badge = signal<string | undefined>(undefined);
  badgeSeverity: 'primary' | 'secondary' | 'info' | 'success' | 'warn' | 'help' | 'danger' | 'contrast' = 'secondary';
  fluid = false;
  clicks = 0;
  onClick(): void {
    this.clicks++;
  }
}

function firePointerDown(el: HTMLElement) {
  const event = Object.assign(new Event('pointerdown', { bubbles: true }), { clientX: 5, clientY: 5 });
  el.dispatchEvent(event as PointerEvent);
}

describe('ButtonDirective', () => {
  let animateSpy: jest.Mock;

  beforeEach(() => {
    animateSpy = jest.fn().mockReturnValue({ finished: Promise.resolve() });
    HTMLElement.prototype.animate = animateSpy as unknown as HTMLElement['animate'];
  });

  afterEach(() => {
    delete (HTMLElement.prototype as { animate?: unknown }).animate;
  });

  function createHost(overrides: Partial<HostComponent> = {}) {
    const fixture = TestBed.createComponent(HostComponent);
    Object.assign(fixture.componentInstance, overrides);
    fixture.detectChanges();
    return { fixture, button: fixture.componentInstance.host().nativeElement };
  }

  it('applies the filled/primary/default-size classes by default', () => {
    const { button } = createHost();

    expect(button.className).toContain('bg-brand-500');
    expect(button.className).toContain('px-4 py-2.5');
  });

  it('reacts to severity/variant/size input changes', () => {
    const { button } = createHost({ severity: 'danger', variant: 'outlined', size: 'lg' });

    expect(button.className).toContain('border-danger-500');
    expect(button.className).toContain('px-5 py-2.5');
    expect(button.className).not.toContain('bg-brand-500');
  });

  it('merges a consumer class override via mergeClasses, winning over the internal class', () => {
    const { button } = createHost({ extraClass: 'rounded-full' });

    expect(button.className).toContain('rounded-full');
    expect(button.className).not.toContain('rounded-md');
  });

  it('keeps the shared disabled-state utility classes regardless of the disabled attribute', () => {
    const { button } = createHost();
    expect(button.className).toContain('disabled:pointer-events-none');
    expect(button.className).toContain('disabled:opacity-(--opacity-disabled)');
  });

  it('preserves native button semantics (disabled attribute, type)', () => {
    const { button } = createHost({ disabled: true });

    expect(button.disabled).toBe(true);
    expect(button.type).toBe('button');
  });

  it('triggers the ripple effect (hostDirectives wiring) on pointerdown', () => {
    const { button } = createHost();

    firePointerDown(button);

    expect(animateSpy).toHaveBeenCalledTimes(1);
    expect(button.querySelector('span')).not.toBeNull();
  });

  it('forwards medRippleDisabled to the underlying RippleDirective', () => {
    const { button } = createHost({ rippleDisabled: true });

    firePointerDown(button);

    expect(animateSpy).not.toHaveBeenCalled();
  });

  it('sets square padding when iconOnly is true', () => {
    const { button } = createHost({ iconOnly: true });

    expect(button.className).toContain('aspect-square');
    expect(button.className).toContain('p-2.5');
  });

  it('applies aria-invalid and the shared danger ring when invalid is true', () => {
    const { button } = createHost({ invalid: true });

    expect(button.getAttribute('aria-invalid')).toBe('true');
    expect(button.className).toContain('ring-danger-500');
  });

  it('omits aria-invalid when invalid is false', () => {
    const { button } = createHost();

    expect(button.getAttribute('aria-invalid')).toBeNull();
  });

  it('applies the elevation shadow when raised is true, nothing when false', () => {
    const raisedTokens = createHost({ raised: true }).button.className.split(' ');
    expect(raisedTokens).toContain('shadow');
    expect(raisedTokens).toContain('hover:shadow-md');

    const plainTokens = createHost({ raised: false }).button.className.split(' ');
    expect(plainTokens).not.toContain('shadow');
    expect(plainTokens).not.toContain('hover:shadow-md');
  });

  it('plain forces the secondary/neutral color classes regardless of severity, per variant', () => {
    const filled = createHost({ severity: 'danger', variant: 'filled', plain: true }).button;
    expect(filled.className).toContain('bg-surface-100');
    expect(filled.className).not.toContain('bg-danger-500');

    const outlined = createHost({ severity: 'success', variant: 'outlined', plain: true }).button;
    expect(outlined.className).toContain('border-surface-300');
    expect(outlined.className).not.toContain('border-success-500');
  });

  it('plain: false leaves the severity color untouched', () => {
    const { button } = createHost({ severity: 'danger', plain: false });
    expect(button.className).toContain('bg-danger-500');
  });

  it('sets aria-busy and dims interaction when loading is true, without rendering a spinner', () => {
    const { button } = createHost({ loading: true });

    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.className).toContain('pointer-events-none');
    expect(button.className).toContain('opacity-(--opacity-disabled)');
    expect(button.querySelector('med-progress-spinner')).toBeNull();
  });

  it('omits aria-busy when loading is false', () => {
    const { button } = createHost();

    expect(button.getAttribute('aria-busy')).toBeNull();
  });

  it('cancels the Enter-key activation behavior when loading is true, so a real browser never synthesizes the resulting click (Wave 2 fix)', () => {
    const { button } = createHost({ loading: true });

    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    button.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it('cancels the Space-key activation behavior when loading is true', () => {
    const { button } = createHost({ loading: true });

    const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    button.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it('a non-loading button leaves Enter/Space activation alone', () => {
    const { button } = createHost({ loading: false });

    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    button.dispatchEvent(enterEvent);
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    button.dispatchEvent(spaceEvent);

    expect(enterEvent.defaultPrevented).toBe(false);
    expect(spaceEvent.defaultPrevented).toBe(false);
  });

  it("a non-loading button still runs the consumer's declaratively-bound (click) handler", () => {
    const { fixture, button } = createHost({ loading: false });

    button.click();

    expect(fixture.componentInstance.clicks).toBe(1);
  });

  // @scenario UI-005.S1
  it('renders a badge span with the configured badgeSeverity and removes it when cleared', () => {
    const { fixture, button } = createHost({ badgeSeverity: 'danger' });
    fixture.componentInstance.badge.set('5');
    fixture.detectChanges();

    const badgeEl = button.querySelector('[data-med-button-badge]') as HTMLElement | null;
    expect(badgeEl).not.toBeNull();
    expect(badgeEl?.textContent?.trim()).toBe('5');
    expect(badgeEl?.className).toContain('bg-danger-500');

    fixture.componentInstance.badge.set('');
    fixture.detectChanges();
    expect(button.querySelector('[data-med-button-badge]')).toBeNull();
  });

  it('applies full width when fluid is true', () => {
    const { button } = createHost({ fluid: true });

    expect(button.className.split(' ')).toContain('w-full');
  });
});
