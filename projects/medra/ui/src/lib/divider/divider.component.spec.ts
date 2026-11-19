import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DividerAlign, DividerComponent } from './divider.component';

@Component({
  standalone: true,
  imports: [DividerComponent],
  template: `<med-divider [orientation]="orientation" [align]="align">OR</med-divider>`,
})
class AlignedHostComponent {
  orientation: 'horizontal' | 'vertical' = 'horizontal';
  align: DividerAlign = 'center';
}

@Component({
  standalone: true,
  imports: [DividerComponent],
  template: `<med-divider [orientation]="orientation" [type]="type" [class]="extraClass" />`,
})
class HostComponent {
  orientation: 'horizontal' | 'vertical' = 'horizontal';
  type: 'solid' | 'dashed' | 'dotted' = 'solid';
  extraClass = '';
}

describe('DividerComponent', () => {
  function createHost(overrides: Partial<HostComponent> = {}) {
    const fixture = TestBed.createComponent(HostComponent);
    Object.assign(fixture.componentInstance, overrides);
    fixture.detectChanges();
    return { divider: fixture.nativeElement.querySelector('med-divider') as HTMLElement };
  }

  it('is a horizontal full-width line by default', () => {
    const { divider } = createHost();
    expect(divider.className).toContain('w-full');
    expect(divider.className).toContain('h-px');
    expect(divider.getAttribute('aria-orientation')).toBe('horizontal');
  });

  it('becomes a vertical full-height line when orientation is vertical', () => {
    const { divider } = createHost({ orientation: 'vertical' });
    expect(divider.className).toContain('h-full');
    expect(divider.className).toContain('w-px');
    expect(divider.getAttribute('aria-orientation')).toBe('vertical');
  });

  it('has role=separator', () => {
    const { divider } = createHost();
    expect(divider.getAttribute('role')).toBe('separator');
  });

  it('merges a consumer class override', () => {
    const { divider } = createHost({ extraClass: 'bg-danger-500' });
    expect(divider.className).toContain('bg-danger-500');
  });

  describe('type', () => {
    it('solid (default) keeps the filled-background line, no border', () => {
      const { divider } = createHost();
      expect(divider.className).toContain('bg-surface-200');
      expect(divider.className).not.toContain('border-t');
      expect(divider.className).not.toContain('border-dashed');
    });

    it('dashed switches to a border-based line (horizontal)', () => {
      const { divider } = createHost({ type: 'dashed' });
      expect(divider.className).toContain('border-t');
      expect(divider.className).toContain('border-dashed');
      expect(divider.className).not.toContain('bg-surface-200');
    });

    it('dotted switches to a border-based line (horizontal)', () => {
      const { divider } = createHost({ type: 'dotted' });
      expect(divider.className).toContain('border-t');
      expect(divider.className).toContain('border-dotted');
    });

    it('dashed uses border-l for a vertical divider, not border-t', () => {
      const { divider } = createHost({ type: 'dashed', orientation: 'vertical' });
      expect(divider.className).toContain('border-l');
      expect(divider.className).toContain('border-dashed');
      expect(divider.className).not.toContain('border-t');
    });
  });

  // @scenario UI-006.S1
  describe('align (Wave 2)', () => {
    function createAligned(align: DividerAlign, orientation: 'horizontal' | 'vertical' = 'horizontal') {
      const fixture = TestBed.createComponent(AlignedHostComponent);
      fixture.componentInstance.align = align;
      fixture.componentInstance.orientation = orientation;
      fixture.detectChanges();
      return fixture.nativeElement.querySelector('med-divider') as HTMLElement;
    }

    it('projects inline content and aligns start/center/end', () => {
      const start = createAligned('start');
      expect(start.textContent?.trim()).toBe('OR');
      expect(start.className).toContain('justify-start');

      const center = createAligned('center');
      expect(center.className).toContain('justify-center');

      const end = createAligned('end');
      expect(end.className).toContain('justify-end');
    });

    it('supports vertical alignment with start/center/end', () => {
      const endVertical = createAligned('end', 'vertical');
      expect(endVertical.className).toContain('flex-col');
      expect(endVertical.className).toContain('justify-end');
    });
  });
});
