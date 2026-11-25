import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TabComponent } from './tab.component';
import { TabsComponent } from './tabs.component';

@Component({
  standalone: true,
  imports: [TabsComponent, TabComponent],
  template: `
    <med-tabs [(activeIndex)]="activeIndex">
      <med-tab header="Profile">Profile content</med-tab>
      <med-tab header="Billing" [disabled]="billingDisabled">Billing content</med-tab>
      <med-tab header="Settings">Settings content</med-tab>
    </med-tabs>
  `,
})
class HostComponent {
  activeIndex = 0;
  billingDisabled = false;
}

function create(overrides: Partial<HostComponent> = {}) {
  const fixture = TestBed.createComponent(HostComponent);
  Object.assign(fixture.componentInstance, overrides);
  fixture.detectChanges();
  return fixture;
}

function tabButtons(fixture: { nativeElement: HTMLElement }): HTMLButtonElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('[role="tab"]'));
}

function panels(fixture: { nativeElement: HTMLElement }): HTMLElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('[role="tabpanel"]'));
}

describe('TabsComponent', () => {
  it('renders one tab button per <med-tab>, labeled from its header', () => {
    const fixture = create();
    expect(tabButtons(fixture).map((b) => b.textContent?.trim())).toEqual(['Profile', 'Billing', 'Settings']);
  });

  // Regression: setting only `overflow-x-auto` leaves `overflow-y` at the
  // browser's default `visible`, which the CSS Overflow spec then silently
  // promotes to `auto` (a `visible` axis can't coexist with a non-`visible`
  // one) — popping a real vertical scrollbar under a single-line tab row
  // whose `-mb-px` border-overlap trick leaves ~1px of vertical overflow.
  it('pins overflow-y so it never inherits a vertical scrollbar from overflow-x-auto', () => {
    const fixture = create();
    const tablist = fixture.nativeElement.querySelector('[role="tablist"]') as HTMLElement;
    expect(tablist.className).toContain('overflow-x-auto');
    expect(tablist.className).toContain('overflow-y-hidden');
  });

  it('shows only the active panel, hiding the rest via the hidden attribute', () => {
    const fixture = create();
    const [profile, billing, settings] = panels(fixture);
    expect(profile.hidden).toBe(false);
    expect(billing.hidden).toBe(true);
    expect(settings.hidden).toBe(true);
  });

  it('clicking a tab switches the active panel and updates aria-selected', () => {
    const fixture = create();
    tabButtons(fixture)[2].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.activeIndex).toBe(2);
    expect(tabButtons(fixture)[2].getAttribute('aria-selected')).toBe('true');
    expect(tabButtons(fixture)[0].getAttribute('aria-selected')).toBe('false');
    expect(panels(fixture)[2].hidden).toBe(false);
    expect(panels(fixture)[0].hidden).toBe(true);
  });

  it('links each tab button to its panel via aria-controls/id and aria-labelledby', () => {
    const fixture = create();
    const button = tabButtons(fixture)[0];
    const panel = panels(fixture)[0];
    expect(button.getAttribute('aria-controls')).toBe(panel.id);
    expect(panel.getAttribute('aria-labelledby')).toBe(button.id);
  });

  it('only the active tab is in the Tab order (roving tabindex)', () => {
    const fixture = create();
    expect(tabButtons(fixture).map((b) => b.tabIndex)).toEqual([0, -1, -1]);

    tabButtons(fixture)[2].click();
    fixture.detectChanges();
    expect(tabButtons(fixture).map((b) => b.tabIndex)).toEqual([-1, -1, 0]);
  });

  it('ArrowRight/ArrowLeft move to the next/previous tab, wrapping at the ends', () => {
    const fixture = create();

    tabButtons(fixture)[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex).toBe(1);

    // In a real browser, focus moved to tab 1 after ArrowRight, so the
    // follow-up ArrowLeft keydown would naturally land there next.
    tabButtons(fixture)[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex).toBe(0);
  });

  it('ArrowRight skips a disabled tab', () => {
    const fixture = create({ billingDisabled: true });

    tabButtons(fixture)[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.activeIndex).toBe(2); // Billing (1) skipped
  });

  it('Home/End jump to the first/last enabled tab', () => {
    const fixture = create();
    tabButtons(fixture)[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex).toBe(2);

    tabButtons(fixture)[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex).toBe(0);
  });

  it('clicking a disabled tab does nothing', () => {
    const fixture = create({ billingDisabled: true });

    tabButtons(fixture)[1].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.activeIndex).toBe(0);
  });

  it('activeIndex supports external two-way binding', () => {
    const fixture = create({ activeIndex: 2 });

    expect(tabButtons(fixture)[2].getAttribute('aria-selected')).toBe('true');
    expect(panels(fixture)[2].hidden).toBe(false);
  });

  it('marks a disabled tab button with aria-disabled', () => {
    const fixture = create({ billingDisabled: true });

    expect(tabButtons(fixture)[1].getAttribute('aria-disabled')).toBe('true');
  });

  describe('lazy content (<ng-template> wrapper)', () => {
    // Spies live in the constructor (called exactly once per instantiation, unlike a
    // template-interpolated method, which is re-invoked on every change-detection pass) —
    // that's what makes "instantiated exactly once" a meaningful assertion here.
    const billingCtorSpy = jest.fn();
    const settingsCtorSpy = jest.fn();

    @Component({ standalone: true, selector: 'app-billing-content', template: `<span class="billing-marker">Billing content</span>` })
    class BillingContent {
      constructor() {
        billingCtorSpy();
      }
    }

    @Component({ standalone: true, selector: 'app-settings-content', template: `<span class="settings-marker">Settings content</span>` })
    class SettingsContent {
      constructor() {
        settingsCtorSpy();
      }
    }

    @Component({
      standalone: true,
      imports: [TabsComponent, TabComponent, BillingContent, SettingsContent],
      template: `
        <med-tabs [(activeIndex)]="activeIndex">
          <med-tab header="Profile">Profile content (eager, no template)</med-tab>
          <med-tab header="Billing">
            <ng-template>
              <app-billing-content />
            </ng-template>
          </med-tab>
          <med-tab header="Settings">
            <ng-template>
              <app-settings-content />
            </ng-template>
          </med-tab>
        </med-tabs>
      `,
    })
    class LazyHostComponent {
      activeIndex = 0;
    }

    beforeEach(() => {
      billingCtorSpy.mockClear();
      settingsCtorSpy.mockClear();
    });

    function createLazy(overrides: Partial<LazyHostComponent> = {}) {
      const fixture = TestBed.createComponent(LazyHostComponent);
      Object.assign(fixture.componentInstance, overrides);
      fixture.detectChanges();
      return fixture;
    }

    it("does not instantiate a lazy tab's content before it is ever activated", () => {
      const fixture = createLazy();
      expect(billingCtorSpy).not.toHaveBeenCalled();
      expect(settingsCtorSpy).not.toHaveBeenCalled();
      expect(fixture.nativeElement.querySelector('.billing-marker')).toBeNull();
    });

    it('a tab with no <ng-template> keeps eager projection unchanged', () => {
      const fixture = createLazy();
      expect(fixture.nativeElement.textContent).toContain('Profile content (eager, no template)');
    });

    it('instantiates the content the first time the tab becomes active', () => {
      const fixture = createLazy();
      tabButtons(fixture)[1].click(); // Billing
      fixture.detectChanges();

      expect(billingCtorSpy).toHaveBeenCalledTimes(1);
      expect(fixture.nativeElement.querySelector('.billing-marker')).not.toBeNull();
    });

    it('never re-instantiates once activated, even after switching away and back', () => {
      const fixture = createLazy();
      tabButtons(fixture)[1].click(); // Billing
      fixture.detectChanges();
      expect(billingCtorSpy).toHaveBeenCalledTimes(1);

      tabButtons(fixture)[0].click(); // Profile
      fixture.detectChanges();
      tabButtons(fixture)[1].click(); // back to Billing
      fixture.detectChanges();

      expect(billingCtorSpy).toHaveBeenCalledTimes(1); // still just once
    });

    it('a tab that starts active instantiates its lazy content immediately', () => {
      const fixture = createLazy({ activeIndex: 2 }); // Settings starts active
      expect(settingsCtorSpy).toHaveBeenCalledTimes(1);
      expect(billingCtorSpy).not.toHaveBeenCalled(); // Billing was never active
    });
  });

  describe('showNavigators', () => {
    @Component({
      standalone: true,
      imports: [TabsComponent, TabComponent],
      template: `
        <med-tabs [showNavigators]="showNavigators" [scrollPrevLabel]="scrollPrevLabel" [scrollNextLabel]="scrollNextLabel">
          <med-tab header="Profile">Profile content</med-tab>
          <med-tab header="Billing">Billing content</med-tab>
          <med-tab header="Settings">Settings content</med-tab>
        </med-tabs>
      `,
    })
    class NavHostComponent {
      showNavigators = true;
      scrollPrevLabel = 'Scroll tabs left';
      scrollNextLabel = 'Scroll tabs right';
    }

    // jsdom has no layout engine — scrollWidth/clientWidth/scrollLeft are always
    // 0 by default, so canScrollPrev/canScrollNext would never go true without
    // faking real measurements onto the tablist element directly, the same way
    // exportCSV's tests mock the Blob constructor rather than depend on a real
    // browser API jsdom doesn't implement.
    function mockScrollMetrics(el: HTMLElement, { scrollLeft = 0, clientWidth = 100, scrollWidth = 100 } = {}) {
      Object.defineProperty(el, 'scrollLeft', { value: scrollLeft, configurable: true });
      Object.defineProperty(el, 'clientWidth', { value: clientWidth, configurable: true });
      Object.defineProperty(el, 'scrollWidth', { value: scrollWidth, configurable: true });
    }

    function tablist(fixture: { nativeElement: HTMLElement }): HTMLElement {
      return fixture.nativeElement.querySelector('[role="tablist"]') as HTMLElement;
    }

    function navButtons(fixture: { nativeElement: HTMLElement }): HTMLButtonElement[] {
      return Array.from(fixture.nativeElement.querySelectorAll('button[aria-label="Scroll tabs left"], button[aria-label="Scroll tabs right"]'));
    }

    function createNav(overrides: Partial<NavHostComponent> = {}) {
      const fixture = TestBed.createComponent(NavHostComponent);
      Object.assign(fixture.componentInstance, overrides);
      fixture.detectChanges();
      return fixture;
    }

    function tabsComponent(fixture: ReturnType<typeof createNav>): { updateScrollState(): void } {
      return fixture.debugElement.children[0].componentInstance as { updateScrollState(): void };
    }

    it('renders no scroll buttons by default (showNavigators off)', () => {
      const fixture = create();
      expect(navButtons(fixture)).toHaveLength(0);
    });

    it('renders no scroll buttons when on but nothing overflows (both directions unscrollable)', () => {
      const fixture = createNav();
      expect(navButtons(fixture)).toHaveLength(0);
    });

    it('shows only the "scroll right" button when content overflows and is scrolled to the start', () => {
      const fixture = createNav();
      mockScrollMetrics(tablist(fixture), { scrollLeft: 0, clientWidth: 100, scrollWidth: 400 });
      tabsComponent(fixture).updateScrollState();
      fixture.detectChanges();

      expect(navButtons(fixture).map((b) => b.getAttribute('aria-label'))).toEqual(['Scroll tabs right']);
    });

    it('shows only the "scroll left" button when scrolled all the way to the end', () => {
      const fixture = createNav();
      mockScrollMetrics(tablist(fixture), { scrollLeft: 300, clientWidth: 100, scrollWidth: 400 });
      tabsComponent(fixture).updateScrollState();
      fixture.detectChanges();

      expect(navButtons(fixture).map((b) => b.getAttribute('aria-label'))).toEqual(['Scroll tabs left']);
    });

    it('shows both buttons when scrolled partway through overflowing content', () => {
      const fixture = createNav();
      mockScrollMetrics(tablist(fixture), { scrollLeft: 150, clientWidth: 100, scrollWidth: 400 });
      tabsComponent(fixture).updateScrollState();
      fixture.detectChanges();

      expect(navButtons(fixture).map((b) => b.getAttribute('aria-label')).sort()).toEqual(['Scroll tabs left', 'Scroll tabs right']);
    });

    it('clicking "scroll right" calls scrollBy on the tab list with a positive offset', () => {
      const fixture = createNav();
      const el = tablist(fixture);
      mockScrollMetrics(el, { scrollLeft: 0, clientWidth: 100, scrollWidth: 400 });
      tabsComponent(fixture).updateScrollState();
      fixture.detectChanges();

      const scrollBySpy = jest.fn();
      el.scrollBy = scrollBySpy;
      navButtons(fixture)[0].click();

      expect(scrollBySpy).toHaveBeenCalledWith(expect.objectContaining({ left: 80, behavior: 'smooth' }));
    });

    it('uses custom scrollPrevLabel/scrollNextLabel', () => {
      const fixture = createNav({ scrollPrevLabel: 'Rolar à esquerda', scrollNextLabel: 'Rolar à direita' });
      mockScrollMetrics(tablist(fixture), { scrollLeft: 150, clientWidth: 100, scrollWidth: 400 });
      tabsComponent(fixture).updateScrollState();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('button[aria-label="Rolar à esquerda"]')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('button[aria-label="Rolar à direita"]')).not.toBeNull();
    });
  });

  describe('custom header template (#header) (TBD-002.S1)', () => {
    const lazyBodyCtorSpy = jest.fn();

    @Component({
      standalone: true,
      selector: 'app-custom-lazy-body',
      template: `<p class="custom-lazy-body">Lazy body content</p>`,
    })
    class CustomLazyBody {
      constructor() {
        lazyBodyCtorSpy();
      }
    }

    @Component({
      standalone: true,
      imports: [TabsComponent, TabComponent, CustomLazyBody],
      template: `
        <med-tabs>
          <med-tab>
            <ng-template #header>
              <span class="custom-header-1">Overview <em>(3)</em></span>
            </ng-template>
            <p class="eager-body">Eager overview body</p>
          </med-tab>
          <med-tab>
            <ng-template #header>
              <span class="custom-header-2">Activity <span class="badge">New</span></span>
            </ng-template>
            <ng-template>
              <app-custom-lazy-body />
            </ng-template>
          </med-tab>
          <med-tab header="Plain">
            <p class="plain-body">Plain header body</p>
          </med-tab>
        </med-tabs>
      `,
    })
    class CustomHeaderHostComponent {}

    beforeEach(() => {
      lazyBodyCtorSpy.mockClear();
    });

    function createCustomHeader() {
      const fixture = TestBed.createComponent(CustomHeaderHostComponent);
      fixture.detectChanges();
      return fixture;
    }

    it('TBD-002.S1: renders #header inside role="tab" with default activeIndex, eager/lazy bodies, and click/keyboard switching', () => {
      const fixture = createCustomHeader();
      const buttons = tabButtons(fixture);
      const tabPanels = panels(fixture);

      expect(buttons).toHaveLength(3);
      expect(buttons[0].querySelector('.custom-header-1')?.textContent).toContain('Overview (3)');
      expect(buttons[1].querySelector('.custom-header-2')?.textContent).toContain('Activity New');
      expect(buttons[2].textContent?.trim()).toBe('Plain');

      // Eager body is rendered only in panel 0, not in the tab button
      expect(buttons[0].querySelector('.eager-body')).toBeNull();
      expect(tabPanels[0].querySelector('.eager-body')?.textContent).toContain('Eager overview body');
      expect(tabPanels[0].hidden).toBe(false);

      // Lazy body is not instantiated until activated and never treated as header or rendered eagerly
      expect(lazyBodyCtorSpy).not.toHaveBeenCalled();
      expect(tabPanels[1].querySelector('.custom-lazy-body')).toBeNull();
      expect(buttons[1].querySelector('.custom-lazy-body')).toBeNull();
      expect(tabPanels[1].hidden).toBe(true);

      // Click second custom-header tab (with lazy body)
      buttons[1].click();
      fixture.detectChanges();

      expect(buttons[0].getAttribute('aria-selected')).toBe('false');
      expect(buttons[1].getAttribute('aria-selected')).toBe('true');
      expect(tabPanels[0].hidden).toBe(true);
      expect(tabPanels[1].hidden).toBe(false);
      expect(lazyBodyCtorSpy).toHaveBeenCalledTimes(1);
      expect(tabPanels[1].querySelector('.custom-lazy-body')?.textContent).toContain('Lazy body content');

      // Keyboard ArrowRight to Plain tab, then ArrowLeft back to custom-header tab 1
      buttons[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
      fixture.detectChanges();
      expect(buttons[2].getAttribute('aria-selected')).toBe('true');
      expect(tabPanels[2].hidden).toBe(false);
      expect(tabPanels[1].hidden).toBe(true);

      buttons[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true }));
      fixture.detectChanges();
      expect(buttons[1].getAttribute('aria-selected')).toBe('true');
      expect(tabPanels[1].hidden).toBe(false);
      expect(lazyBodyCtorSpy).toHaveBeenCalledTimes(1);
    });
  });
});
