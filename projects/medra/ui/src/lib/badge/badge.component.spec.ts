import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BadgeComponent } from './badge.component';

@Component({
  standalone: true,
  imports: [BadgeComponent],
  template: `<med-badge [severity]="severity" [size]="size" [dot]="dot" [ariaLabel]="ariaLabel" [badgeDisabled]="badgeDisabled" [class]="extraClass">{{ text }}</med-badge>`,
})
class HostComponent {
  severity: 'primary' | 'danger' = 'primary';
  size: 'sm' | 'default' | 'lg' | 'xl' = 'default';
  dot = false;
  ariaLabel: string | null = null;
  badgeDisabled = false;
  extraClass = '';
  text = '3';
}

describe('BadgeComponent', () => {
  function createHost(overrides: Partial<HostComponent> = {}) {
    const fixture = TestBed.createComponent(HostComponent);
    Object.assign(fixture.componentInstance, overrides);
    fixture.detectChanges();
    return { fixture, badge: fixture.nativeElement.querySelector('med-badge > span') as HTMLElement };
  }

  it('renders the projected content', () => {
    const { fixture } = createHost();
    expect(fixture.nativeElement.textContent).toContain('3');
  });

  it.each([
    ['primary', 'bg-brand-500'],
    ['danger', 'bg-danger-500'],
  ] as const)('severity=%s applies %s', (severity, expectedClass) => {
    const { badge } = createHost({ severity });
    expect(badge.className).toContain(expectedClass);
  });

  it.each([
    ['sm', 'h-4'],
    ['default', 'h-5'],
    ['lg', 'h-6'],
    ['xl', 'h-7'],
  ] as const)('size=%s sets height %s', (size, expectedClass) => {
    const { badge } = createHost({ size });
    expect(badge.className).toContain(expectedClass);
  });

  it('renders as a small dot with no padding when dot is true', () => {
    const { badge } = createHost({ dot: true });
    expect(badge.className).toContain('size-2');
    expect(badge.className).toContain('p-0');
  });

  it('dot mode with an ariaLabel renders an sr-only accessible name (Wave 2 fix)', () => {
    const { fixture } = createHost({ dot: true, ariaLabel: 'Unread' });
    const srOnly = fixture.nativeElement.querySelector('.sr-only');
    expect(srOnly?.textContent).toBe('Unread');
  });

  it('dot mode without an ariaLabel renders no accessible name (purely decorative)', () => {
    const { fixture } = createHost({ dot: true });
    expect(fixture.nativeElement.querySelector('.sr-only')).toBeNull();
  });

  it('non-dot mode ignores ariaLabel and still renders projected content', () => {
    const { fixture } = createHost({ dot: false, ariaLabel: 'Ignored' });
    expect(fixture.nativeElement.textContent).toContain('3');
    expect(fixture.nativeElement.querySelector('.sr-only')).toBeNull();
  });

  it('merges a consumer class override', () => {
    const { badge } = createHost({ extraClass: 'text-base' });
    expect(badge.className).toContain('text-base');
  });

  it('badgeDisabled hides the host via the hidden attribute, not a visual state', () => {
    const { fixture } = createHost({ badgeDisabled: true });
    expect((fixture.nativeElement.querySelector('med-badge') as HTMLElement).hidden).toBe(true);
  });

  it('badgeDisabled false leaves the host visible', () => {
    const { fixture } = createHost({ badgeDisabled: false });
    expect((fixture.nativeElement.querySelector('med-badge') as HTMLElement).hidden).toBe(false);
  });

  // @scenario UI-008.S2
  it('renders value input when provided without breaking projected content fallback', () => {
    const fixture = TestBed.createComponent(BadgeComponent);
    fixture.componentRef.setInput('value', 42);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent?.trim()).toBe('42');
  });
});
