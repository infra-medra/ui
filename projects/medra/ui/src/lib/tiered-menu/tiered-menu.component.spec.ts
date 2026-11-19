import { Component, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { TieredMenuComponent } from './tiered-menu.component';
import { TieredMenuItem } from './tiered-menu.types';
import { MenuItem } from '../menu/menu.types';

@Component({
  standalone: true,
  imports: [TieredMenuComponent],
  template: `
    <med-tiered-menu #menu [items]="items" (itemSelect)="onItemSelect($event)" />
    <button #trigger type="button" (click)="menu.toggle(trigger)">Open</button>
  `,
})
class HostComponent {
  @ViewChild(TieredMenuComponent) menu!: TieredMenuComponent;
  renameSpy = jest.fn();
  deleteSpy = jest.fn();
  items: TieredMenuItem[] = [
    { label: 'File', items: [{ label: 'Rename', command: this.renameSpy }, { label: 'Delete', command: this.deleteSpy }] },
    { label: 'Edit', items: [{ label: 'Undo' }, { label: 'Nested', items: [{ label: 'Deep item' }] }] },
    { label: 'View', disabled: true },
  ];
  selected: MenuItem[] = [];

  onItemSelect(item: MenuItem): void {
    this.selected.push(item);
  }
}

function trigger(fixture: { nativeElement: HTMLElement }): HTMLButtonElement {
  return fixture.nativeElement.querySelector('button') as HTMLButtonElement;
}

function menus(): HTMLElement[] {
  return Array.from(document.querySelectorAll('[role="menu"]'));
}

function itemsOf(menu: HTMLElement): HTMLElement[] {
  return Array.from(menu.querySelectorAll('[role="menuitem"]'));
}

function keydown(el: HTMLElement, key: string) {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

function pointerEnter(el: HTMLElement) {
  el.dispatchEvent(new Event('pointerenter', { bubbles: true }));
}

describe('TieredMenuComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [OverlayModule] });
  });

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
    jest.useRealTimers();
  });

  function create() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('opens the root panel on trigger click', () => {
    const fixture = create();
    trigger(fixture).click();
    fixture.detectChanges();
    expect(menus().length).toBe(1);
    expect(itemsOf(menus()[0]).map((el) => el.textContent?.trim())).toEqual(['File', 'Edit', 'View']); // disabled items still render as rows, just aria-disabled
  });

  it('items carry literal aria-haspopup/aria-expanded/aria-disabled values, updated when a submenu opens', () => {
    const fixture = create();
    trigger(fixture).click();
    fixture.detectChanges();

    const [file, edit, view] = itemsOf(menus()[0]);
    expect(file.getAttribute('aria-haspopup')).toBe('menu'); // has children
    expect(file.getAttribute('aria-expanded')).toBe('false'); // not yet opened
    expect(file.getAttribute('aria-disabled')).toBeNull();
    expect(edit.getAttribute('aria-haspopup')).toBe('menu');
    expect(edit.getAttribute('aria-expanded')).toBe('false');
    expect(view.getAttribute('aria-haspopup')).toBeNull(); // leaf, no children
    expect(view.getAttribute('aria-expanded')).toBeNull();
    expect(view.getAttribute('aria-disabled')).toBe('true');

    keydown(menus()[0], 'ArrowRight'); // opens File's submenu (active item starts at File)
    fixture.detectChanges();
    expect(itemsOf(menus()[0])[0].getAttribute('aria-expanded')).toBe('true');
  });

  it('toggling the trigger again closes the panel', () => {
    const fixture = create();
    const btn = trigger(fixture);
    btn.click();
    fixture.detectChanges();
    btn.click();
    fixture.detectChanges();
    expect(menus().length).toBe(0);
  });

  it('ArrowRight on a parent item opens its submenu and moves focus into it', () => {
    const fixture = create();
    trigger(fixture).click();
    fixture.detectChanges();

    keydown(menus()[0], 'ArrowRight'); // active item starts at "File" (first enabled)
    fixture.detectChanges();

    expect(menus().length).toBe(2);
    expect(itemsOf(menus()[1]).map((el) => el.textContent?.trim())).toEqual(['Rename', 'Delete']);
  });

  it('ArrowLeft in a submenu closes just that submenu, not the whole tree', () => {
    const fixture = create();
    trigger(fixture).click();
    fixture.detectChanges();
    keydown(menus()[0], 'ArrowRight');
    fixture.detectChanges();
    expect(menus().length).toBe(2);

    keydown(menus()[1], 'ArrowLeft');
    fixture.detectChanges();
    expect(menus().length).toBe(1); // root still open
  });

  it('Home/End jump to the first/last enabled item in the panel', () => {
    const fixture = create();
    trigger(fixture).click();
    fixture.detectChanges();

    // File(0), Edit(1), View(2, disabled) — End should land on Edit, the last enabled item.
    keydown(menus()[0], 'End');
    fixture.detectChanges();
    expect(menus()[0].getAttribute('aria-activedescendant')).toMatch(/item-1$/);

    keydown(menus()[0], 'Home');
    fixture.detectChanges();
    expect(menus()[0].getAttribute('aria-activedescendant')).toMatch(/item-0$/);
  });

  it('Space on a parent item opens its submenu, same as Enter/ArrowRight', () => {
    const fixture = create();
    trigger(fixture).click();
    fixture.detectChanges();

    keydown(menus()[0], ' '); // active item starts at "File" (first enabled, has children)
    fixture.detectChanges();

    expect(menus().length).toBe(2);
    expect(itemsOf(menus()[1]).map((el) => el.textContent?.trim())).toEqual(['Rename', 'Delete']);
  });

  it('Space activates a leaf item, same as Enter', () => {
    const fixture = create();
    trigger(fixture).click();
    fixture.detectChanges();
    keydown(menus()[0], 'ArrowRight'); // open File's submenu, active = Rename
    fixture.detectChanges();

    keydown(menus()[1], ' ');
    fixture.detectChanges();

    expect(fixture.componentInstance.renameSpy).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.selected).toEqual([{ label: 'Rename', command: fixture.componentInstance.renameSpy }]);
    expect(menus().length).toBe(0); // both levels closed
  });

  it('hovering a parent item opens its submenu after a short delay', () => {
    jest.useFakeTimers();
    const fixture = create();
    trigger(fixture).click();
    fixture.detectChanges();

    pointerEnter(itemsOf(menus()[0])[0]); // "File"
    fixture.detectChanges();
    expect(menus().length).toBe(1); // not yet, still waiting out the hover-intent delay

    jest.advanceTimersByTime(150);
    fixture.detectChanges();
    expect(menus().length).toBe(2);
  });

  it('selecting a nested leaf item calls its command(), emits itemSelect once, and closes the entire tree', () => {
    const fixture = create();
    trigger(fixture).click();
    fixture.detectChanges();
    keydown(menus()[0], 'ArrowRight'); // open File's submenu
    fixture.detectChanges();

    keydown(menus()[1], 'Enter'); // activates "Rename" (first enabled item in the submenu)
    fixture.detectChanges();

    expect(fixture.componentInstance.renameSpy).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.selected).toEqual([{ label: 'Rename', command: fixture.componentInstance.renameSpy }]);
    expect(menus().length).toBe(0); // both levels closed
  });

  it('a doubly-nested submenu opens and a selection there also closes everything', () => {
    const fixture = create();
    trigger(fixture).click();
    fixture.detectChanges();
    keydown(menus()[0], 'ArrowDown'); // move active from File to Edit
    fixture.detectChanges();
    keydown(menus()[0], 'ArrowRight'); // open Edit's submenu (Undo, Nested)
    fixture.detectChanges();
    keydown(menus()[1], 'ArrowDown'); // move active from Undo to Nested
    fixture.detectChanges();
    keydown(menus()[1], 'ArrowRight'); // open Nested's submenu (Deep item)
    fixture.detectChanges();

    expect(menus().length).toBe(3);
    keydown(menus()[2], 'Enter');
    fixture.detectChanges();

    expect(menus().length).toBe(0);
  });

  it('Escape closes only the deepest open level', () => {
    const fixture = create();
    trigger(fixture).click();
    fixture.detectChanges();
    keydown(menus()[0], 'ArrowRight');
    fixture.detectChanges();
    expect(menus().length).toBe(2);

    menus()[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(menus().length).toBe(1);
  });

  it('Tab closes the entire tree', () => {
    const fixture = create();
    trigger(fixture).click();
    fixture.detectChanges();
    keydown(menus()[0], 'ArrowRight');
    fixture.detectChanges();
    expect(menus().length).toBe(2);

    keydown(menus()[1], 'Tab');
    fixture.detectChanges();
    expect(menus().length).toBe(0);
  });

  it('close() closes the whole tree programmatically', () => {
    const fixture = create();
    trigger(fixture).click();
    fixture.detectChanges();
    keydown(menus()[0], 'ArrowRight');
    fixture.detectChanges();
    expect(menus().length).toBe(2);

    fixture.componentInstance.menu.close();
    fixture.detectChanges();
    expect(menus().length).toBe(0);
  });

  it('destroying the host while nested submenus are open closes the whole tree', () => {
    const fixture = create();
    trigger(fixture).click();
    fixture.detectChanges();
    keydown(menus()[0], 'ArrowRight');
    fixture.detectChanges();
    expect(menus().length).toBe(2);

    fixture.destroy();
    expect(menus().length).toBe(0);
  });

  describe('url/target/badge', () => {
    @Component({
      standalone: true,
      imports: [TieredMenuComponent],
      template: `
        <med-tiered-menu #menu [items]="items" />
        <button #trigger type="button" (click)="menu.toggle(trigger)">Open</button>
      `,
    })
    class UrlHostComponent {
      @ViewChild(TieredMenuComponent) menu!: TieredMenuComponent;
      items: TieredMenuItem[] = [
        { label: 'Docs', url: 'https://example.com/docs', target: '_blank', badge: 'New' },
        { label: 'File', url: 'https://example.com/should-be-ignored', items: [{ label: 'Rename' }] },
      ];
    }

    it('renders a leaf item with url as a real <a href>, with a badge alongside it', () => {
      const fixture = TestBed.createComponent(UrlHostComponent);
      fixture.detectChanges();
      trigger(fixture).click();
      fixture.detectChanges();

      const link = menus()[0].querySelector('a') as HTMLAnchorElement;
      expect(link.getAttribute('href')).toBe('https://example.com/docs');
      expect(link.getAttribute('target')).toBe('_blank');
      expect(itemsOf(menus()[0])[0].textContent).toContain('New');
    });

    it('an item with children never becomes an <a>, even with a url set', () => {
      const fixture = TestBed.createComponent(UrlHostComponent);
      fixture.detectChanges();
      trigger(fixture).click();
      fixture.detectChanges();

      const links = Array.from(menus()[0].querySelectorAll('a'));
      expect(links).toHaveLength(1); // only "Docs", not "File"
    });
  });

  describe('popup=false (inline mode)', () => {
    @Component({
      standalone: true,
      imports: [TieredMenuComponent],
      template: `<med-tiered-menu [items]="items" [popup]="false" (itemSelect)="onItemSelect($event)" />`,
    })
    class InlineHostComponent {
      renameSpy = jest.fn();
      items: TieredMenuItem[] = [{ label: 'File', items: [{ label: 'Rename', command: this.renameSpy }] }, { label: 'Edit' }];
      selected: MenuItem[] = [];

      onItemSelect(item: MenuItem): void {
        this.selected.push(item);
      }
    }

    it('renders the menu inline (no overlay, no trigger needed) as soon as it is created', () => {
      const fixture = TestBed.createComponent(InlineHostComponent);
      fixture.detectChanges();

      expect(menus()).toHaveLength(1);
      expect(itemsOf(menus()[0]).map((el) => el.textContent?.trim())).toEqual(['File', 'Edit']);
      expect(document.querySelectorAll('.cdk-overlay-container [role="menu"]')).toHaveLength(0);
    });

    it('does not steal focus from the page on render, unlike a real popup', () => {
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      const fixture = TestBed.createComponent(InlineHostComponent);
      fixture.detectChanges();

      expect(document.activeElement).toBe(input);
      input.remove();
    });

    it('a submenu still cascades as a real flyout overlay on ArrowRight', () => {
      const fixture = TestBed.createComponent(InlineHostComponent);
      fixture.detectChanges();
      keydown(menus()[0], 'ArrowRight');
      fixture.detectChanges();

      expect(menus()).toHaveLength(2);
      expect(document.querySelectorAll('.cdk-overlay-container [role="menu"]')).toHaveLength(1);
    });

    it('activating a leaf item calls command() and emits itemSelect, same as popup mode', () => {
      const fixture = TestBed.createComponent(InlineHostComponent);
      fixture.detectChanges();
      keydown(menus()[0], 'ArrowRight');
      fixture.detectChanges();
      keydown(menus()[1], 'Enter');
      fixture.detectChanges();

      expect(fixture.componentInstance.renameSpy).toHaveBeenCalledTimes(1);
      expect(fixture.componentInstance.selected).toHaveLength(1);
    });

    it('open()/toggle()/close() are no-ops, isOpen stays false', () => {
      const fixture = TestBed.createComponent(InlineHostComponent);
      fixture.detectChanges();
      const menu = fixture.debugElement.query((de) => de.componentInstance instanceof TieredMenuComponent).componentInstance as TieredMenuComponent;

      expect(menu.isOpen).toBe(false);
      menu.toggle(document.createElement('button'));
      fixture.detectChanges();

      expect(menu.isOpen).toBe(false);
      expect(menus()).toHaveLength(1); // still just the inline menu, nothing extra opened
    });
  });

  describe('typeahead', () => {
    beforeEach(() => jest.useFakeTimers());

    function activeItemText(menuEl: HTMLElement): string | undefined {
      const activeId = menuEl.getAttribute('aria-activedescendant');
      return activeId ? (menuEl.querySelector(`#${activeId}`)?.textContent?.trim() ?? undefined) : undefined;
    }

    it('typing a character moves the active item to the first enabled match', () => {
      const fixture = create();
      trigger(fixture).click();
      fixture.detectChanges();
      keydown(menus()[0], 'e'); // File, Edit, View — "e" matches Edit
      fixture.detectChanges();
      expect(activeItemText(menus()[0])).toBe('Edit');
    });

    it('never matches a disabled item, leaving activeIndex untouched', () => {
      const fixture = create();
      trigger(fixture).click();
      fixture.detectChanges();
      expect(activeItemText(menus()[0])).toBe('File'); // initial activeIndex: first enabled item
      keydown(menus()[0], 'v'); // View starts with "v" but is disabled
      fixture.detectChanges();
      expect(activeItemText(menus()[0])).toBe('File'); // unchanged, a miss
    });

    it('accumulates multiple keystrokes into a single search buffer', () => {
      const fixture = create();
      trigger(fixture).click();
      fixture.detectChanges();
      keydown(menus()[0], 'e');
      fixture.detectChanges();
      keydown(menus()[0], 'd');
      fixture.detectChanges();
      expect(activeItemText(menus()[0])).toBe('Edit'); // "ed" still matches Edit
    });

    it('clears the search buffer after 500ms of inactivity', () => {
      const fixture = create();
      trigger(fixture).click();
      fixture.detectChanges();
      keydown(menus()[0], 'e');
      fixture.detectChanges();
      jest.advanceTimersByTime(500);
      keydown(menus()[0], 'f'); // fresh buffer: "f" matches File, not stale "ef"
      fixture.detectChanges();
      expect(activeItemText(menus()[0])).toBe('File');
    });

    it('ignores Ctrl/Alt/Meta key combinations, not treating them as search characters', () => {
      const fixture = create();
      trigger(fixture).click();
      fixture.detectChanges();
      menus()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'e', ctrlKey: true, bubbles: true, cancelable: true }));
      fixture.detectChanges();
      expect(activeItemText(menus()[0])).toBe('File'); // unchanged
    });
  });
});
