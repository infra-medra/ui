import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { TooltipDirective } from './tooltip.directive';

@Component({
  standalone: true,
  imports: [TooltipDirective],
  template: `
    <button
      [medTooltip]="text"
      [tooltipDisabled]="disabled"
      [showDelay]="showDelay"
      [hideDelay]="hideDelay"
      [hideOnEscape]="hideOnEscape"
      [showOnEllipsis]="showOnEllipsis"
      [life]="life"
    >
      Hover me
    </button>
  `,
})
class HostComponent {
  text = 'Helpful hint';
  disabled = false;
  showDelay = 0;
  hideDelay = 0;
  hideOnEscape = true;
  showOnEllipsis = false;
  life: number | null = null;
}

function trigger(fixture: ComponentFixture<HostComponent>): HTMLElement {
  return fixture.nativeElement.querySelector('button') as HTMLElement;
}

function tooltip(): HTMLElement | null {
  return document.querySelector('[role="tooltip"]');
}

describe('TooltipDirective', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [OverlayModule] });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  function create(overrides: Partial<HostComponent> = {}) {
    const fixture = TestBed.createComponent(HostComponent);
    Object.assign(fixture.componentInstance, overrides);
    fixture.detectChanges();
    return fixture;
  }

  it('is not shown initially', () => {
    create();
    expect(tooltip()).toBeNull();
  });

  it('shows on mouseenter and hides on mouseleave', () => {
    const fixture = create();
    trigger(fixture).dispatchEvent(new MouseEvent('mouseenter'));
    jest.runAllTimers();
    fixture.detectChanges();

    expect(tooltip()).not.toBeNull();
    expect(tooltip()!.textContent?.trim()).toBe('Helpful hint');

    trigger(fixture).dispatchEvent(new MouseEvent('mouseleave'));
    jest.runAllTimers();
    fixture.detectChanges();

    expect(tooltip()).toBeNull();
  });

  it('shows on focus and hides on blur (keyboard accessibility)', () => {
    const fixture = create();
    trigger(fixture).dispatchEvent(new FocusEvent('focus'));
    jest.runAllTimers();
    fixture.detectChanges();

    expect(tooltip()).not.toBeNull();

    trigger(fixture).dispatchEvent(new FocusEvent('blur'));
    jest.runAllTimers();
    fixture.detectChanges();

    expect(tooltip()).toBeNull();
  });

  it('respects showDelay/hideDelay', () => {
    const fixture = create({ showDelay: 300, hideDelay: 200 });

    trigger(fixture).dispatchEvent(new MouseEvent('mouseenter'));
    jest.advanceTimersByTime(299);
    fixture.detectChanges();
    expect(tooltip()).toBeNull();

    jest.advanceTimersByTime(1);
    fixture.detectChanges();
    expect(tooltip()).not.toBeNull();

    trigger(fixture).dispatchEvent(new MouseEvent('mouseleave'));
    jest.advanceTimersByTime(199);
    fixture.detectChanges();
    expect(tooltip()).not.toBeNull();

    jest.advanceTimersByTime(1);
    fixture.detectChanges();
    expect(tooltip()).toBeNull();
  });

  it('a mouseleave before showDelay elapses cancels the pending show', () => {
    const fixture = create({ showDelay: 300 });

    trigger(fixture).dispatchEvent(new MouseEvent('mouseenter'));
    jest.advanceTimersByTime(100);
    trigger(fixture).dispatchEvent(new MouseEvent('mouseleave'));
    jest.runAllTimers();
    fixture.detectChanges();

    expect(tooltip()).toBeNull();
  });

  it('never shows when tooltipDisabled is true', () => {
    const fixture = create({ disabled: true });

    trigger(fixture).dispatchEvent(new MouseEvent('mouseenter'));
    jest.runAllTimers();
    fixture.detectChanges();

    expect(tooltip()).toBeNull();
  });

  it('never shows for empty content', () => {
    const fixture = create({ text: '' });

    trigger(fixture).dispatchEvent(new MouseEvent('mouseenter'));
    jest.runAllTimers();
    fixture.detectChanges();

    expect(tooltip()).toBeNull();
  });

  it('sets aria-describedby on the host only while the tooltip is open', () => {
    const fixture = create();
    expect(trigger(fixture).getAttribute('aria-describedby')).toBeNull();

    trigger(fixture).dispatchEvent(new MouseEvent('mouseenter'));
    jest.runAllTimers();
    fixture.detectChanges();

    const describedBy = trigger(fixture).getAttribute('aria-describedby');
    expect(describedBy).not.toBeNull();
    expect(tooltip()!.id).toBe(describedBy);

    trigger(fixture).dispatchEvent(new MouseEvent('mouseleave'));
    jest.runAllTimers();
    fixture.detectChanges();

    expect(trigger(fixture).getAttribute('aria-describedby')).toBeNull();
  });

  it('renders content as plain text, never interpreted as HTML', () => {
    const fixture = create({ text: '<b>bold</b>' });

    trigger(fixture).dispatchEvent(new MouseEvent('mouseenter'));
    jest.runAllTimers();
    fixture.detectChanges();

    expect(tooltip()!.querySelector('b')).toBeNull();
    expect(tooltip()!.textContent).toContain('<b>bold</b>');
  });

  it('closes the tooltip on destroy, leaving no leaked overlay', () => {
    const fixture = create();
    trigger(fixture).dispatchEvent(new MouseEvent('mouseenter'));
    jest.runAllTimers();
    fixture.detectChanges();
    expect(tooltip()).not.toBeNull();

    fixture.destroy();

    expect(tooltip()).toBeNull();
  });

  describe('hideOnEscape', () => {
    it('defaults to true — Escape closes an open tooltip', () => {
      const fixture = create();
      trigger(fixture).dispatchEvent(new MouseEvent('mouseenter'));
      jest.runAllTimers();
      fixture.detectChanges();
      expect(tooltip()).not.toBeNull();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      fixture.detectChanges();

      expect(tooltip()).toBeNull();
    });

    it('false keeps the tooltip open on Escape', () => {
      const fixture = create({ hideOnEscape: false });
      trigger(fixture).dispatchEvent(new MouseEvent('mouseenter'));
      jest.runAllTimers();
      fixture.detectChanges();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      fixture.detectChanges();

      expect(tooltip()).not.toBeNull();
    });

    it('does nothing when nothing is open (no listener attached)', () => {
      const fixture = create();
      expect(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))).not.toThrow();
      fixture.detectChanges();
      expect(tooltip()).toBeNull();
    });
  });

  describe('showOnEllipsis', () => {
    // jsdom never actually lays out text, so offsetWidth/scrollWidth are
    // always 0 — same limitation this codebase already documents for other
    // real-layout-dependent measurements (Tabs' showNavigators, TreeTable's
    // frozen columns): mocked directly here via Object.defineProperty,
    // matching the same technique those specs already established.
    function mockEllipsis(el: HTMLElement, hasEllipsis: boolean): void {
      Object.defineProperty(el, 'offsetWidth', { value: 100, configurable: true });
      Object.defineProperty(el, 'scrollWidth', { value: hasEllipsis ? 200 : 100, configurable: true });
      Object.defineProperty(el, 'offsetHeight', { value: 20, configurable: true });
      Object.defineProperty(el, 'scrollHeight', { value: 20, configurable: true });
    }

    it('off (default) — shows regardless of truncation', () => {
      const fixture = create();
      mockEllipsis(trigger(fixture), false);
      trigger(fixture).dispatchEvent(new MouseEvent('mouseenter'));
      jest.runAllTimers();
      fixture.detectChanges();

      expect(tooltip()).not.toBeNull();
    });

    it('on — does not show when the trigger content is not truncated', () => {
      const fixture = create({ showOnEllipsis: true });
      mockEllipsis(trigger(fixture), false);
      trigger(fixture).dispatchEvent(new MouseEvent('mouseenter'));
      jest.runAllTimers();
      fixture.detectChanges();

      expect(tooltip()).toBeNull();
    });

    it('on — shows when the trigger content is actually truncated', () => {
      const fixture = create({ showOnEllipsis: true });
      mockEllipsis(trigger(fixture), true);
      trigger(fixture).dispatchEvent(new MouseEvent('mouseenter'));
      jest.runAllTimers();
      fixture.detectChanges();

      expect(tooltip()).not.toBeNull();
    });
  });

  describe('life', () => {
    it('unset (default) — never auto-hides on its own', () => {
      const fixture = create();
      trigger(fixture).dispatchEvent(new MouseEvent('mouseenter'));
      jest.runAllTimers();
      fixture.detectChanges();
      expect(tooltip()).not.toBeNull();

      jest.advanceTimersByTime(100_000);
      fixture.detectChanges();
      expect(tooltip()).not.toBeNull();
    });

    it('auto-hides after life ms, even while still hovering', () => {
      const fixture = create({ life: 1000 });
      trigger(fixture).dispatchEvent(new MouseEvent('mouseenter'));
      // Not runAllTimers(): it would also exhaust the life timer scheduled
      // the moment showDelay's own timer fires, closing the tooltip before
      // this assertion. advanceTimersByTime(0) flushes just showDelay=0.
      jest.advanceTimersByTime(0);
      fixture.detectChanges();
      expect(tooltip()).not.toBeNull();

      jest.advanceTimersByTime(999);
      fixture.detectChanges();
      expect(tooltip()).not.toBeNull();

      jest.advanceTimersByTime(1);
      fixture.detectChanges();
      expect(tooltip()).toBeNull();
    });

    it('a normal mouseleave before life elapses still closes it via the usual hideDelay path', () => {
      const fixture = create({ life: 1000, hideDelay: 50 });
      trigger(fixture).dispatchEvent(new MouseEvent('mouseenter'));
      jest.advanceTimersByTime(0); // flush showDelay=0 only, leave the life timer pending
      fixture.detectChanges();
      expect(tooltip()).not.toBeNull();

      trigger(fixture).dispatchEvent(new MouseEvent('mouseleave'));
      jest.advanceTimersByTime(50);
      fixture.detectChanges();

      expect(tooltip()).toBeNull();
    });
  });

  describe('UI-009.S2 tooltipEvent and TemplateRef content', () => {
    it('[UI-009.S2] respects tooltipEvent="focus" and ignores hover when focus-only', () => {
      @Component({
        standalone: true,
        imports: [TooltipDirective],
        template: `<button type="button" medTooltip="Focus tip" tooltipEvent="focus">Btn</button>`,
      })
      class FocusOnlyHost {}

      const fixture = TestBed.createComponent(FocusOnlyHost);
      fixture.detectChanges();
      const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

      btn.dispatchEvent(new MouseEvent('mouseenter'));
      jest.advanceTimersByTime(0);
      fixture.detectChanges();
      expect(tooltip()).toBeNull();

      btn.dispatchEvent(new FocusEvent('focus'));
      jest.advanceTimersByTime(0);
      fixture.detectChanges();
      expect(tooltip()?.textContent?.trim()).toBe('Focus tip');
    });

    it('[UI-009.S2][M-03] renders TemplateRef content safely without innerHTML', () => {
      @Component({
        standalone: true,
        imports: [TooltipDirective],
        template: `
          <ng-template #tipTpl><span data-testid="tpl-tip">{{ untrusted }}</span></ng-template>
          <button type="button" [medTooltip]="tipTpl">Btn</button>
        `,
      })
      class TemplateTooltipHost {
        untrusted = '<script>alert(1)</script>';
      }

      const fixture = TestBed.createComponent(TemplateTooltipHost);
      fixture.detectChanges();
      const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

      btn.dispatchEvent(new MouseEvent('mouseenter'));
      jest.advanceTimersByTime(0);
      fixture.detectChanges();

      const el = tooltip();
      expect(el?.querySelector('[data-testid="tpl-tip"]')?.textContent).toBe('<script>alert(1)</script>');
      expect(el?.querySelector('script')).toBeNull();
    });
  });
});
