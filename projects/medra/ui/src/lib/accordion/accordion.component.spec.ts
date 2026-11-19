import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IconComponent } from '../icon/icon.component';
import { AccordionTabHeaderDirective } from './accordion-tab.directives';
import { AccordionTabComponent } from './accordion-tab.component';
import { AccordionComponent } from './accordion.component';

@Component({
  standalone: true,
  imports: [AccordionComponent, AccordionTabComponent],
  template: `
    <med-accordion
      [(activeIndex)]="activeIndex"
      [multiple]="multiple"
      [expandIcon]="expandIcon"
      [collapseIcon]="collapseIcon"
      (opened)="openedLog.push($event)"
      (closed)="closedLog.push($event)"
    >
      <med-accordion-tab header="General">General content</med-accordion-tab>
      <med-accordion-tab header="Billing" [disabled]="billingDisabled">Billing content</med-accordion-tab>
      <med-accordion-tab header="Advanced">Advanced content</med-accordion-tab>
    </med-accordion>
  `,
})
class HostComponent {
  activeIndex: number | readonly number[] | null = null;
  multiple = false;
  billingDisabled = false;
  expandIcon = 'chevron-down';
  collapseIcon = 'chevron-down';
  openedLog: number[] = [];
  closedLog: number[] = [];
}

function create(overrides: Partial<HostComponent> = {}) {
  const fixture = TestBed.createComponent(HostComponent);
  Object.assign(fixture.componentInstance, overrides);
  fixture.detectChanges();
  return fixture;
}

function headerButtons(fixture: { nativeElement: HTMLElement }): HTMLButtonElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('h3 button'));
}

function panels(fixture: { nativeElement: HTMLElement }): HTMLElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('[aria-labelledby]'));
}

describe('AccordionComponent', () => {
  it('renders one header per <med-accordion-tab>, labeled from its header input', () => {
    const fixture = create();
    expect(headerButtons(fixture).map((b) => b.textContent?.trim())).toEqual(['General', 'Billing', 'Advanced']);
  });

  it('all panels collapsed by default (activeIndex null)', () => {
    const fixture = create();
    expect(panels(fixture).every((p) => p.hidden)).toBe(true);
    expect(headerButtons(fixture).every((b) => b.getAttribute('aria-expanded') === 'false')).toBe(true);
  });

  it('clicking a header expands its panel and sets aria-expanded', () => {
    const fixture = create();
    headerButtons(fixture)[1].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.activeIndex).toBe(1);
    expect(panels(fixture)[1].hidden).toBe(false);
    expect(headerButtons(fixture)[1].getAttribute('aria-expanded')).toBe('true');
  });

  it('clicking the expanded header again collapses it (single mode)', () => {
    const fixture = create({ activeIndex: 1 });
    headerButtons(fixture)[1].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.activeIndex).toBeNull();
    expect(panels(fixture)[1].hidden).toBe(true);
  });

  it('single mode: expanding a different panel collapses the previously open one', () => {
    const fixture = create({ activeIndex: 0 });
    headerButtons(fixture)[2].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.activeIndex).toBe(2);
    expect(panels(fixture)[0].hidden).toBe(true);
    expect(panels(fixture)[2].hidden).toBe(false);
  });

  it('multiple mode: expanding a panel does not collapse others', () => {
    const fixture = create({ multiple: true, activeIndex: [0] });
    headerButtons(fixture)[2].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.activeIndex).toEqual([0, 2]);
    expect(panels(fixture)[0].hidden).toBe(false);
    expect(panels(fixture)[2].hidden).toBe(false);
  });

  it('multiple mode: clicking an already-expanded header removes just that index', () => {
    const fixture = create({ multiple: true, activeIndex: [0, 1] });
    headerButtons(fixture)[0].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.activeIndex).toEqual([1]);
  });

  it('links each header to its panel via aria-controls/id and aria-labelledby', () => {
    const fixture = create();
    const button = headerButtons(fixture)[0];
    const panel = panels(fixture)[0];
    expect(button.getAttribute('aria-controls')).toBe(panel.id);
    expect(panel.getAttribute('aria-labelledby')).toBe(button.id);
  });

  it('clicking a disabled header does nothing', () => {
    const fixture = create({ billingDisabled: true });
    headerButtons(fixture)[1].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.activeIndex).toBeNull();
  });

  it('marks a disabled header with aria-disabled', () => {
    const fixture = create({ billingDisabled: true });
    expect(headerButtons(fixture)[1].getAttribute('aria-disabled')).toBe('true');
  });

  it('every header keeps normal tab order (no roving tabindex)', () => {
    const fixture = create();
    expect(headerButtons(fixture).every((b) => b.tabIndex !== -1)).toBe(true);
  });

  it('ArrowDown/ArrowUp move focus between headers, wrapping at the ends', () => {
    const fixture = create();
    const buttons = headerButtons(fixture);
    buttons[0].focus();
    buttons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(headerButtons(fixture)[1]);

    headerButtons(fixture)[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(headerButtons(fixture)[0]);

    headerButtons(fixture)[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(headerButtons(fixture)[2]);
  });

  it('ArrowDown skips a disabled header', () => {
    const fixture = create({ billingDisabled: true });
    const buttons = headerButtons(fixture);
    buttons[0].focus();
    buttons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(headerButtons(fixture)[2]);
  });

  it('Home/End move focus to the first/last enabled header', () => {
    const fixture = create();
    const buttons = headerButtons(fixture);
    buttons[0].focus();
    buttons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(headerButtons(fixture)[2]);

    headerButtons(fixture)[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(headerButtons(fixture)[0]);
  });

  it('activeIndex supports external two-way binding', () => {
    const fixture = create({ activeIndex: 2 });
    expect(headerButtons(fixture)[2].getAttribute('aria-expanded')).toBe('true');
    expect(panels(fixture)[2].hidden).toBe(false);
  });

  describe('opened/closed events', () => {
    it('emits opened with the index when a panel expands', () => {
      const fixture = create();
      headerButtons(fixture)[1].click();
      fixture.detectChanges();

      expect(fixture.componentInstance.openedLog).toEqual([1]);
      expect(fixture.componentInstance.closedLog).toEqual([]);
    });

    it('emits closed with the index when a panel collapses (single mode)', () => {
      const fixture = create({ activeIndex: 1 });
      headerButtons(fixture)[1].click();
      fixture.detectChanges();

      expect(fixture.componentInstance.closedLog).toEqual([1]);
    });

    it('single mode: switching panels emits only opened for the new one', () => {
      const fixture = create({ activeIndex: 0 });
      headerButtons(fixture)[2].click();
      fixture.detectChanges();

      expect(fixture.componentInstance.openedLog).toEqual([2]);
      expect(fixture.componentInstance.closedLog).toEqual([]);
    });

    it('does not emit for a disabled header click', () => {
      const fixture = create({ billingDisabled: true });
      headerButtons(fixture)[1].click();
      fixture.detectChanges();

      expect(fixture.componentInstance.openedLog).toEqual([]);
      expect(fixture.componentInstance.closedLog).toEqual([]);
    });

    it('does not emit for a programmatic activeIndex write', () => {
      const fixture = create();
      const accordion = fixture.debugElement.query(By.directive(AccordionComponent)).componentInstance as AccordionComponent;
      accordion.activeIndex.set(1);
      fixture.detectChanges();

      expect(fixture.componentInstance.openedLog).toEqual([]);
      expect(fixture.componentInstance.closedLog).toEqual([]);
    });
  });

  describe('expandIcon/collapseIcon', () => {
    function iconNames(fixture: { debugElement: import('@angular/core').DebugElement }): string[] {
      return fixture.debugElement.queryAll(By.directive(IconComponent)).map((de) => (de.componentInstance as IconComponent).name());
    }

    it('defaults both to chevron-down and rotates the collapsed icon', () => {
      const fixture = create({ activeIndex: 0 });
      expect(iconNames(fixture)).toEqual(['chevron-down', 'chevron-down', 'chevron-down']);

      const icons = fixture.debugElement.queryAll(By.directive(IconComponent));
      const expandedSvgClass = (icons[0].nativeElement as HTMLElement).querySelector('svg')!.getAttribute('class');
      const collapsedSvgClass = (icons[1].nativeElement as HTMLElement).querySelector('svg')!.getAttribute('class');
      expect(expandedSvgClass).not.toContain('-rotate-90');
      expect(collapsedSvgClass).toContain('-rotate-90');
    });

    it('swaps to the custom icon per state and stops rotating when the two differ', () => {
      const fixture = create({ activeIndex: 0, expandIcon: 'plus', collapseIcon: 'minus' });
      expect(iconNames(fixture)).toEqual(['minus', 'plus', 'plus']);

      const icons = fixture.debugElement.queryAll(By.directive(IconComponent));
      expect((icons[0].nativeElement as HTMLElement).querySelector('svg')!.getAttribute('class')).not.toContain('-rotate-90');
      expect((icons[1].nativeElement as HTMLElement).querySelector('svg')!.getAttribute('class')).not.toContain('-rotate-90');
    });
  });

  describe('medAccordionTabHeader slot', () => {
    it('renders the projected rich header instead of the plain-string header', () => {
      @Component({
        standalone: true,
        imports: [AccordionComponent, AccordionTabComponent, AccordionTabHeaderDirective],
        template: `
          <med-accordion>
            <med-accordion-tab header="Fallback text">
              <span medAccordionTabHeader class="header-marker">Rich <b>header</b></span>
              Body content
            </med-accordion-tab>
          </med-accordion>
        `,
      })
      class HostWithHeaderSlot {}

      const fixture = TestBed.createComponent(HostWithHeaderSlot);
      fixture.detectChanges();

      const button = headerButtons(fixture)[0];
      expect(button.querySelector('.header-marker')).not.toBeNull();
      expect(button.textContent?.trim()).toBe('Rich header');
    });

    it('falls back to the plain-string header when no slot is projected', () => {
      const fixture = create();
      expect(headerButtons(fixture)[0].textContent?.trim()).toBe('General');
    });
  });
});
