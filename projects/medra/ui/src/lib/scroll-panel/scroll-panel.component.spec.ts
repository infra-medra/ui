import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ScrollPanelComponent } from './scroll-panel.component';

@Component({
  standalone: true,
  imports: [ScrollPanelComponent],
  // A static `class="..."` attribute, not `[class]="expr"` — Angular applies a
  // static class attribute to a component's host natively, on top of whatever
  // the component does with its own aliased `class` input; a property binding
  // doesn't reproduce that (see ScrollPanelComponent's own doc for why the
  // fix was folding the host and the viewport into one element).
  template: `
    <med-scroll-panel [ariaLabel]="ariaLabel" class="max-h-64">
      <p style="height: 2000px;">Tall content</p>
    </med-scroll-panel>
  `,
})
class HostComponent {
  ariaLabel: string | null = null;
}

function viewport(fixture: { nativeElement: HTMLElement }): HTMLElement {
  return fixture.nativeElement.querySelector('med-scroll-panel') as HTMLElement;
}

function create(configure?: (host: HostComponent) => void) {
  const fixture = TestBed.createComponent(HostComponent);
  configure?.(fixture.componentInstance);
  fixture.detectChanges();
  return fixture;
}

describe('ScrollPanelComponent', () => {
  it('renders a keyboard-focusable, scrollable viewport — the host itself, not a nested div', () => {
    const fixture = create();
    const el = viewport(fixture);
    expect(el.getAttribute('tabindex')).toBe('0');
    expect(el.getAttribute('role')).toBe('region');
    expect(el.className).toContain('overflow-auto');
  });

  it('applies aria-label to the viewport when provided', () => {
    const fixture = create((host) => (host.ariaLabel = 'Changelog'));
    expect(viewport(fixture).getAttribute('aria-label')).toBe('Changelog');
  });

  it('omits aria-label when not provided', () => {
    const fixture = create();
    expect(viewport(fixture).hasAttribute('aria-label')).toBe(false);
  });

  it('projects content into the viewport', () => {
    const fixture = create();
    expect(viewport(fixture).textContent).toContain('Tall content');
  });

  it('merges a consumer class (a real static attribute, as every consumer actually writes it) onto the host, with no separate wrapper div for it to disagree with', () => {
    const fixture = create();
    const el = viewport(fixture);
    expect(el.className).toContain('max-h-64');
    expect(el.querySelector('div')).toBeNull(); // no inner wrapper left — the host is the viewport
  });

  describe('scrollTop()', () => {
    // jsdom has no real layout engine — scrollHeight/clientHeight always
    // read 0 unless mocked directly, same workaround already established
    // for Tabs' showNavigators and Tooltip's showOnEllipsis.
    function mockScrollMetrics(el: HTMLElement, { scrollHeight, clientHeight }: { scrollHeight: number; clientHeight: number }) {
      Object.defineProperty(el, 'scrollHeight', { value: scrollHeight, configurable: true });
      Object.defineProperty(el, 'clientHeight', { value: clientHeight, configurable: true });
    }

    function scrollPanelInstance(fixture: { debugElement: import('@angular/core').DebugElement }): ScrollPanelComponent {
      return fixture.debugElement.query(By.directive(ScrollPanelComponent)).componentInstance as ScrollPanelComponent;
    }

    it('sets scrollTop to the given value when within range', () => {
      const fixture = create();
      const el = viewport(fixture);
      mockScrollMetrics(el, { scrollHeight: 2000, clientHeight: 200 });

      scrollPanelInstance(fixture).scrollTop(500);
      expect(el.scrollTop).toBe(500);
    });

    it('clamps to the max scrollable offset when the value overshoots', () => {
      const fixture = create();
      const el = viewport(fixture);
      mockScrollMetrics(el, { scrollHeight: 2000, clientHeight: 200 });

      scrollPanelInstance(fixture).scrollTop(9999);
      expect(el.scrollTop).toBe(1800);
    });

    it('clamps to 0 when the value is negative', () => {
      const fixture = create();
      const el = viewport(fixture);
      mockScrollMetrics(el, { scrollHeight: 2000, clientHeight: 200 });

      scrollPanelInstance(fixture).scrollTop(-50);
      expect(el.scrollTop).toBe(0);
    });
  });

  // @scenario UI-006.S1
  describe('refresh() (Wave 2)', () => {
    it('re-clamps scrollTop when content shrinks', () => {
      const fixture = create();
      const el = viewport(fixture);
      Object.defineProperty(el, 'scrollHeight', { value: 2000, configurable: true });
      Object.defineProperty(el, 'clientHeight', { value: 200, configurable: true });
      const instance = fixture.debugElement.query(By.directive(ScrollPanelComponent)).componentInstance as ScrollPanelComponent;

      instance.scrollTop(1500);
      expect(el.scrollTop).toBe(1500);

      Object.defineProperty(el, 'scrollHeight', { value: 1000, configurable: true });
      instance.refresh();
      expect(el.scrollTop).toBe(800);
    });
  });
});
