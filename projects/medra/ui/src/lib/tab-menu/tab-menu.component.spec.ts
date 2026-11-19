import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MenuItem } from '../menu/menu.types';
import { TabMenuComponent } from './tab-menu.component';

@Component({
  standalone: true,
  imports: [TabMenuComponent],
  template: `<med-tab-menu [items]="items" [(activeIndex)]="activeIndex" />`,
})
class HostComponent {
  items: MenuItem[] = [];
  activeIndex = 0;
}

function tabs(fixture: { nativeElement: HTMLElement }): HTMLButtonElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('[role="tab"]'));
}

function keydown(el: HTMLElement, key: string) {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

function create(configure?: (h: HostComponent) => void) {
  const fixture = TestBed.createComponent(HostComponent);
  configure?.(fixture.componentInstance);
  fixture.detectChanges();
  return fixture;
}

describe('TabMenuComponent', () => {
  const ITEMS: MenuItem[] = [
    { label: 'Home', command: jest.fn() },
    { label: 'Reports', command: jest.fn() },
    { label: 'Disabled', disabled: true },
    { label: 'Settings', command: jest.fn() },
  ];

  it('renders one tab per item, labeled from item.label', () => {
    const fixture = create((h) => (h.items = ITEMS));
    expect(tabs(fixture).map((b) => b.textContent?.trim())).toEqual(['Home', 'Reports', 'Disabled', 'Settings']);
  });

  it('role="tablist" on the container, role="tab" on each item, aria-selected on the active one', () => {
    const fixture = create((h) => (h.items = ITEMS));
    expect(fixture.nativeElement.querySelector('[role="tablist"]')).not.toBeNull();
    expect(tabs(fixture).map((b) => b.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false', 'false']);
  });

  it('clicking a tab activates it and runs its command', () => {
    const fixture = create((h) => (h.items = ITEMS));
    tabs(fixture)[1].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.activeIndex).toBe(1);
    expect(ITEMS[1].command).toHaveBeenCalledTimes(1);
    expect(tabs(fixture)[1].getAttribute('aria-selected')).toBe('true');
  });

  it('clicking a disabled tab does nothing', () => {
    const fixture = create((h) => (h.items = ITEMS));
    tabs(fixture)[2].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex).toBe(0);
  });

  it('ArrowRight moves to the next enabled tab, skipping disabled ones', () => {
    const fixture = create((h) => (h.items = ITEMS));
    keydown(tabs(fixture)[1], 'ArrowRight');
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex).toBe(3); // skips index 2 (disabled)
  });

  it('ArrowLeft wraps from the first tab to the last enabled one', () => {
    const fixture = create((h) => (h.items = ITEMS));
    keydown(tabs(fixture)[0], 'ArrowLeft');
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex).toBe(3);
  });

  it('Home/End jump to the first/last enabled tab', () => {
    const fixture = create((h) => {
      h.items = ITEMS;
      h.activeIndex = 1;
    });
    keydown(tabs(fixture)[1], 'End');
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex).toBe(3);

    keydown(tabs(fixture)[3], 'Home');
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex).toBe(0);
  });

  it('only the active tab has tabindex 0 (roving tabindex)', () => {
    const fixture = create((h) => {
      h.items = ITEMS;
      h.activeIndex = 3;
    });
    expect(tabs(fixture).map((b) => b.tabIndex)).toEqual([-1, -1, -1, 0]);
  });

  describe('url/target/badge', () => {
    it('renders a tab with url as a real <a href role="tab">, with a badge alongside it', () => {
      const fixture = create((h) => {
        h.items = [{ label: 'Docs', url: 'https://example.com/docs', target: '_blank', badge: '3' }];
      });
      const link = fixture.nativeElement.querySelector('a[role="tab"]') as HTMLAnchorElement;
      expect(link).not.toBeNull();
      expect(link.getAttribute('href')).toBe('https://example.com/docs');
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.textContent).toContain('3');
    });

    it('a disabled item with url renders as a real disabled <button>, never a clickable <a>', () => {
      const fixture = create((h) => {
        h.items = [{ label: 'Docs', url: 'https://example.com/docs', disabled: true }];
      });
      expect(fixture.nativeElement.querySelector('a')).toBeNull();
      expect(fixture.nativeElement.querySelector('button[role="tab"]')).not.toBeNull();
    });

    it('keyboard roving-tabindex still works when a tab is rendered as an <a>', () => {
      const fixture = create((h) => {
        h.items = [{ label: 'A' }, { label: 'Docs', url: 'https://example.com/docs' }];
      });
      keydown(tabs(fixture)[0], 'ArrowRight');
      fixture.detectChanges();
      expect(fixture.componentInstance.activeIndex).toBe(1);
      expect(tabs(fixture).map((b) => b.tabIndex)).toEqual([-1, 0]);
    });
  });
});
