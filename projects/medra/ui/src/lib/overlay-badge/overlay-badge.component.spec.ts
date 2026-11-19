import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OverlayBadgeComponent } from './overlay-badge.component';

@Component({
  standalone: true,
  imports: [OverlayBadgeComponent],
  template: `
    <med-overlay-badge [value]="value" [dot]="dot" [hidden]="hidden" [position]="position" [badgeAriaLabel]="badgeAriaLabel">
      <span>Bell icon</span>
    </med-overlay-badge>
  `,
})
class HostComponent {
  value: string | number | null = 5;
  dot = false;
  hidden = false;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' = 'top-right';
  badgeAriaLabel: string | null = null;
}

function badge(fixture: { nativeElement: HTMLElement }): HTMLElement | null {
  return fixture.nativeElement.querySelector('med-badge');
}

/** Badge's own `class` input merges onto its *inner* `<span>`, not the `<med-badge>` host — see badge.component.ts. */
function badgeInner(fixture: { nativeElement: HTMLElement }): HTMLElement | null {
  return fixture.nativeElement.querySelector('med-badge > span');
}

function create(configure?: (h: HostComponent) => void) {
  const fixture = TestBed.createComponent(HostComponent);
  configure?.(fixture.componentInstance);
  fixture.detectChanges();
  return fixture;
}

describe('OverlayBadgeComponent', () => {
  it('renders the wrapped content', () => {
    const fixture = create();
    expect(fixture.nativeElement.textContent).toContain('Bell icon');
  });

  it('shows the badge with the given value, hidden from AT by default', () => {
    const fixture = create();
    const valueSpan = badge(fixture)!.querySelector('span[aria-hidden="true"]');
    expect(valueSpan!.textContent).toBe('5');
  });

  it('omits the value text in dot mode', () => {
    const fixture = create((h) => (h.dot = true));
    expect(badge(fixture)!.querySelector('span[aria-hidden="true"]')).toBeNull();
  });

  it('is hidden entirely when hidden is true, without removing the wrapped content', () => {
    const fixture = create((h) => (h.hidden = true));
    expect(badge(fixture)).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Bell icon');
  });

  it('positions the badge per the position input', () => {
    const fixture = create((h) => (h.position = 'bottom-left'));
    expect(badgeInner(fixture)!.className).toContain('-bottom-1.5');
    expect(badgeInner(fixture)!.className).toContain('-left-1.5');
  });

  it('renders an sr-only announcement when badgeAriaLabel is provided', () => {
    const fixture = create((h) => (h.badgeAriaLabel = '5 unread notifications'));
    const srSpan = badge(fixture)!.querySelector('.sr-only');
    expect(srSpan!.textContent).toBe('5 unread notifications');
  });

  it('renders no sr-only span when badgeAriaLabel is not provided (purely decorative)', () => {
    const fixture = create();
    expect(badge(fixture)!.querySelector('.sr-only')).toBeNull();
  });

  // Regression: defaulting to Badge's own standalone 'default' size made a
  // multi-character value like "99+" widen into a pill that visually
  // swallowed a small wrapped icon almost entirely.
  it('defaults to the sm badge size, not Badge\'s own standalone default — overlay content is usually icon-scale', () => {
    const fixture = create();
    expect(badgeInner(fixture)!.className).toContain('h-4');
    expect(badgeInner(fixture)!.className).not.toContain('h-5');
  });

  // Regression: a ring proportioned for a 16px+ value badge reads as a blob
  // around a 6px dot — dot mode gets a thinner separating ring.
  it('uses a thinner separating ring in dot mode than for a value badge', () => {
    const dotFixture = create((h) => (h.dot = true));
    expect(badgeInner(dotFixture)!.className).toContain('ring-1');
    expect(badgeInner(dotFixture)!.className).not.toContain('ring-2');

    const valueFixture = create();
    expect(badgeInner(valueFixture)!.className).toContain('ring-2');
    expect(badgeInner(valueFixture)!.className).not.toContain('ring-1');
  });
});
