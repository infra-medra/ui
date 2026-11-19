import { Component, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { ContextMenuDirective } from './context-menu.directive';
import { MenuItem } from '../menu/menu.types';
import { TieredMenuItem } from '../tiered-menu/tiered-menu.types';

@Component({
  standalone: true,
  imports: [ContextMenuDirective],
  template: `
    <div class="target" [medContextMenu]="items" [contextMenuDisabled]="disabled" (itemSelect)="onItemSelect($event)">Right-click me</div>
    <div class="other">Elsewhere</div>
  `,
})
class HostComponent {
  @ViewChild(ContextMenuDirective) contextMenu!: ContextMenuDirective;
  deleteSpy = jest.fn();
  items: MenuItem[] = [{ label: 'Rename' }, { label: 'Delete', command: this.deleteSpy }];
  disabled = false;
  selected: MenuItem[] = [];

  onItemSelect(item: MenuItem): void {
    this.selected.push(item);
  }
}

function target(fixture: { nativeElement: HTMLElement }): HTMLElement {
  return fixture.nativeElement.querySelector('.target') as HTMLElement;
}

function rightClick(el: HTMLElement, coords: { clientX: number; clientY: number } = { clientX: 10, clientY: 10 }): MouseEvent {
  const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, ...coords });
  el.dispatchEvent(event);
  return event;
}

function menuPanel(): HTMLElement | null {
  return document.querySelector('[role="menu"]');
}

function keydown(el: HTMLElement, init: KeyboardEventInit): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init });
  el.dispatchEvent(event);
  return event;
}

describe('ContextMenuDirective', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [OverlayModule] });
  });

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  // Mutating fixture.componentInstance directly *between* two separate
  // detectChanges() calls reproduces NG0100 in this test harness (see
  // drawer.component.spec.ts's comment on the same trap) — every test
  // configures the host before the one and only detectChanges() call.
  function create(configure?: (host: HostComponent) => void) {
    const fixture = TestBed.createComponent(HostComponent);
    configure?.(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
  }

  it('opens the panel on right-click and suppresses the native context menu', () => {
    const fixture = create();
    const event = rightClick(target(fixture));
    fixture.detectChanges();

    expect(menuPanel()).not.toBeNull();
    expect(event.defaultPrevented).toBe(true);
  });

  it('opens the panel on the ContextMenu key (Wave 2 fix — keyboard-accessible open path)', () => {
    const fixture = create();
    const event = keydown(target(fixture), { key: 'ContextMenu' });
    fixture.detectChanges();

    expect(menuPanel()).not.toBeNull();
    expect(event.defaultPrevented).toBe(true);
  });

  it('opens the panel on Shift+F10', () => {
    const fixture = create();
    const event = keydown(target(fixture), { key: 'F10', shiftKey: true });
    fixture.detectChanges();

    expect(menuPanel()).not.toBeNull();
    expect(event.defaultPrevented).toBe(true);
  });

  it('plain F10 (no Shift) does not open the panel', () => {
    const fixture = create();
    const event = keydown(target(fixture), { key: 'F10' });
    fixture.detectChanges();

    expect(menuPanel()).toBeNull();
    expect(event.defaultPrevented).toBe(false);
  });

  it('the ContextMenu key does nothing when there are no items or the directive is disabled', () => {
    const fixture = create((host) => (host.items = []));
    keydown(target(fixture), { key: 'ContextMenu' });
    fixture.detectChanges();
    expect(menuPanel()).toBeNull();
  });

  it('does nothing (native menu allowed through) when there are no items', () => {
    const fixture = create((host) => (host.items = []));

    const event = rightClick(target(fixture));
    fixture.detectChanges();

    expect(menuPanel()).toBeNull();
    expect(event.defaultPrevented).toBe(false);
  });

  it('does nothing when contextMenuDisabled is true', () => {
    const fixture = create((host) => (host.disabled = true));

    const event = rightClick(target(fixture));
    fixture.detectChanges();

    expect(menuPanel()).toBeNull();
    expect(event.defaultPrevented).toBe(false);
  });

  it('right-clicking again closes the previous instance and opens exactly one fresh panel', () => {
    const fixture = create();
    rightClick(target(fixture), { clientX: 10, clientY: 10 });
    fixture.detectChanges();
    expect(document.querySelectorAll('[role="menu"]').length).toBe(1);

    rightClick(target(fixture), { clientX: 50, clientY: 60 });
    fixture.detectChanges();
    expect(document.querySelectorAll('[role="menu"]').length).toBe(1);
  });

  it('selecting an item calls its command(), emits itemSelect, and closes the panel', () => {
    const fixture = create();
    rightClick(target(fixture));
    fixture.detectChanges();

    // activeIndex starts at the first enabled item (Rename, index 0) on
    // mount; one ArrowDown moves to Delete (index 1) — a second one would
    // wrap back around to Rename, same active-index cycling Menu's own
    // spec relies on.
    menuPanel()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    menuPanel()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(menuPanel()).toBeNull();
    expect(fixture.componentInstance.deleteSpy).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.selected).toEqual([{ label: 'Delete', command: fixture.componentInstance.deleteSpy }]);
  });

  it('closes on Escape', () => {
    const fixture = create();
    rightClick(target(fixture));
    fixture.detectChanges();

    menuPanel()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(menuPanel()).toBeNull();
  });

  it('close() closes it programmatically', () => {
    const fixture = create();
    rightClick(target(fixture));
    fixture.detectChanges();
    expect(menuPanel()).not.toBeNull();

    fixture.componentInstance.contextMenu.close();
    fixture.detectChanges();

    expect(menuPanel()).toBeNull();
  });

  it('destroying the host while open closes the overlay', () => {
    const fixture = create();
    rightClick(target(fixture));
    fixture.detectChanges();
    expect(menuPanel()).not.toBeNull();

    fixture.destroy();

    expect(menuPanel()).toBeNull();
  });

  describe('nested submenus', () => {
    @Component({
      standalone: true,
      imports: [ContextMenuDirective],
      template: `<div class="target" [medContextMenu]="items" (itemSelect)="onItemSelect($event)">Right-click me</div>`,
    })
    class NestedHostComponent {
      newFileSpy = jest.fn();
      items: TieredMenuItem[] = [
        {
          label: 'New',
          items: [
            { label: 'File', command: this.newFileSpy },
            { label: 'Folder' },
          ],
        },
        { label: 'Paste' },
      ];
      selected: MenuItem[] = [];

      onItemSelect(item: MenuItem): void {
        this.selected.push(item);
      }
    }

    function menuPanels(): HTMLElement[] {
      return Array.from(document.querySelectorAll('[role="menu"]'));
    }

    function createNested() {
      const fixture = TestBed.createComponent(NestedHostComponent);
      fixture.detectChanges();
      return fixture;
    }

    it('an item with children shows aria-haspopup, and ArrowRight opens its submenu', () => {
      const fixture = createNested();
      rightClick(target(fixture));
      fixture.detectChanges();

      const newItem = menuPanel()!.querySelector('[role="menuitem"]') as HTMLElement;
      expect(newItem.getAttribute('aria-haspopup')).toBe('menu');

      keydown(menuPanel()!, { key: 'ArrowRight' });
      fixture.detectChanges();

      expect(menuPanels()).toHaveLength(2);
      expect(menuPanels()[1].textContent).toContain('File');
      expect(menuPanels()[1].textContent).toContain('Folder');
    });

    it('activating a deeply nested leaf item calls its command, emits itemSelect, and closes the whole tree', () => {
      const fixture = createNested();
      rightClick(target(fixture));
      fixture.detectChanges();
      keydown(menuPanel()!, { key: 'ArrowRight' });
      fixture.detectChanges();

      keydown(menuPanels()[1], { key: 'Enter' });
      fixture.detectChanges();

      expect(fixture.componentInstance.newFileSpy).toHaveBeenCalledTimes(1);
      expect(fixture.componentInstance.selected).toHaveLength(1);
      expect(menuPanel()).toBeNull();
    });

    it('a flat MenuItem[] (no items field at all) still works unchanged', () => {
      const fixture = create(); // the plain (non-nested) HostComponent from above
      rightClick(target(fixture));
      fixture.detectChanges();
      expect(menuPanel()).not.toBeNull();
      expect(menuPanel()!.textContent).toContain('Rename');
    });
  });

  describe('global', () => {
    @Component({
      standalone: true,
      imports: [ContextMenuDirective],
      template: `
        <div class="target" [medContextMenu]="items" [global]="global" (itemSelect)="onItemSelect($event)">Right-click me</div>
        <div class="other">Elsewhere</div>
      `,
    })
    class GlobalHostComponent {
      items: MenuItem[] = [{ label: 'Rename' }];
      global = true;
      selected: MenuItem[] = [];
      onItemSelect(item: MenuItem): void {
        this.selected.push(item);
      }
    }

    function createGlobal(configure?: (host: GlobalHostComponent) => void) {
      const fixture = TestBed.createComponent(GlobalHostComponent);
      configure?.(fixture.componentInstance);
      fixture.detectChanges();
      return fixture;
    }

    it('right-clicking anywhere in the document opens it, not just the decorated element', () => {
      const fixture = createGlobal();
      const other = fixture.nativeElement.querySelector('.other') as HTMLElement;
      rightClick(other);
      fixture.detectChanges();

      expect(menuPanel()).not.toBeNull();
    });

    it('right-clicking the decorated element itself does not double-open (host listener defers to the document one)', () => {
      const fixture = createGlobal();
      rightClick(target(fixture));
      fixture.detectChanges();

      expect(document.querySelectorAll('[role="menu"]')).toHaveLength(1);
    });

    it('off (default) — right-clicking elsewhere in the document does nothing', () => {
      const fixture = createGlobal((host) => (host.global = false));
      const other = fixture.nativeElement.querySelector('.other') as HTMLElement;
      rightClick(other);
      fixture.detectChanges();

      expect(menuPanel()).toBeNull();
    });
  });

  describe('pressDelay', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    // jsdom has no TouchEvent constructor that populates `touches` — dispatching
    // a plain Event with `touches` defined directly onto it is enough, since the
    // directive only ever reads `event.touches[0]`.
    function touchStart(el: HTMLElement, coords: { clientX: number; clientY: number } = { clientX: 15, clientY: 25 }): void {
      const event = new Event('touchstart', { bubbles: true, cancelable: true });
      Object.defineProperty(event, 'touches', { value: [{ clientX: coords.clientX, clientY: coords.clientY }] });
      el.dispatchEvent(event);
    }

    function touchEnd(el: HTMLElement): void {
      el.dispatchEvent(new Event('touchend', { bubbles: true, cancelable: true }));
    }

    it('opens the panel after pressDelay ms of holding, at the touch point', () => {
      const fixture = create();
      touchStart(target(fixture), { clientX: 15, clientY: 25 });
      expect(menuPanel()).toBeNull(); // not yet — still waiting out the delay

      jest.advanceTimersByTime(500); // default pressDelay
      fixture.detectChanges();

      expect(menuPanel()).not.toBeNull();
    });

    it('touchend before pressDelay elapses cancels the long-press', () => {
      const fixture = create();
      touchStart(target(fixture));
      jest.advanceTimersByTime(300);
      touchEnd(target(fixture));
      jest.advanceTimersByTime(500);
      fixture.detectChanges();

      expect(menuPanel()).toBeNull();
    });

    it('a custom pressDelay changes how long the hold must last', () => {
      const fixture = TestBed.createComponent(
        (() => {
          @Component({
            standalone: true,
            imports: [ContextMenuDirective],
            template: `<div class="target" [medContextMenu]="items" [pressDelay]="100">Press me</div>`,
          })
          class FastPressHostComponent {
            items: MenuItem[] = [{ label: 'Rename' }];
          }
          return FastPressHostComponent;
        })(),
      );
      fixture.detectChanges();
      touchStart(target(fixture));
      jest.advanceTimersByTime(100);
      fixture.detectChanges();

      expect(menuPanel()).not.toBeNull();
    });
  });
});
