import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SkeletonComponent } from './skeleton.component';

@Component({
  standalone: true,
  imports: [SkeletonComponent],
  template: `<med-skeleton [shape]="shape" [animation]="animation" [width]="width" [height]="height" [size]="size" [borderRadius]="borderRadius" [class]="customClass" />`,
})
class HostComponent {
  shape: 'rectangle' | 'circle' = 'rectangle';
  animation: 'wave' | 'none' = 'wave';
  width = '100%';
  height = '1rem';
  size: string | null = null;
  borderRadius: string | null = null;
  customClass = '';
}

function el(fixture: { nativeElement: HTMLElement }): HTMLElement {
  return fixture.nativeElement.querySelector('med-skeleton') as HTMLElement;
}

// Mutating fixture.componentInstance directly *between* two separate
// detectChanges() calls reproduces NG0100 (ExpressionChangedAfterItHasBeenCheckedError)
// in this test harness for any bound field, one-way or two-way (verified in
// isolation with a trivial component, see drawer.component.spec.ts's own
// comment on the same trap) — so every test configures the host BEFORE the
// one and only detectChanges() call, never after.
function create(configure?: (host: HostComponent) => void) {
  const fixture = TestBed.createComponent(HostComponent);
  configure?.(fixture.componentInstance);
  fixture.detectChanges();
  return fixture;
}

describe('SkeletonComponent', () => {
  it('defaults to a rectangle, 100% wide, 1rem tall, with the wave animation', () => {
    const fixture = create();
    const host = el(fixture);
    expect(host.className).toContain('rounded-md');
    expect(host.className).toContain('after:animate-skeleton-wave');
    expect(host.style.width).toBe('100%');
    expect(host.style.height).toBe('1rem');
  });

  it('is aria-hidden unconditionally (decorative placeholder)', () => {
    const fixture = create();
    expect(el(fixture).getAttribute('aria-hidden')).toBe('true');
  });

  it('shape="circle" applies rounded-full instead of rounded-md', () => {
    const fixture = create((host) => (host.shape = 'circle'));
    const host = el(fixture);
    expect(host.className).toContain('rounded-full');
    expect(host.className).not.toContain('rounded-md');
  });

  it('animation="none" omits the shimmer classes', () => {
    const fixture = create((host) => (host.animation = 'none'));
    expect(el(fixture).className).not.toContain('after:animate-skeleton-wave');
  });

  it('width/height reflect as inline styles', () => {
    const fixture = create((host) => {
      host.width = '240px';
      host.height = '2.5rem';
    });
    const host = el(fixture);
    expect(host.style.width).toBe('240px');
    expect(host.style.height).toBe('2.5rem');
  });

  it('size overrides both width and height', () => {
    const fixture = create((host) => {
      host.width = '240px';
      host.height = '2.5rem';
      host.size = '3rem';
    });
    const host = el(fixture);
    expect(host.style.width).toBe('3rem');
    expect(host.style.height).toBe('3rem');
  });

  it('borderRadius overrides the shape-driven radius via inline style', () => {
    const fixture = create((host) => (host.borderRadius = '4px'));
    expect(el(fixture).style.borderRadius).toBe('4px');
  });

  it('merges a consumer class via the escape hatch', () => {
    const fixture = create((host) => (host.customClass = 'my-4'));
    expect(el(fixture).className).toContain('my-4');
  });
});
