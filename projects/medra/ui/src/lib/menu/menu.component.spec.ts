import { Component, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { MenuComponent } from './menu.component';
import { MenuItem, MenuItemGroup } from './menu.types';

@Component({
  standalone: true,
  imports: [MenuComponent],
  template: `
    <button #trigger type="button" (click)="menu.toggle(trigger)">Actions</button>
    <med-menu #menu [items]="items" (itemSelect)="onItemSelect($event)" />
  `,
})
class HostComponent {
  @ViewChild(MenuComponent) menu!: MenuComponent;
  deleteSpy = jest.fn();
  items: MenuItem[] = [{ label: 'Rename' }, { label: 'Delete', command: this.deleteSpy }];
  selected: MenuItem[] = [];

  onItemSelect(item: MenuItem): void {
    this.selected.push(item);
  }
}

function trigger(fixture: { nativeElement: HTMLElement }): HTMLElement {
  return fixture.nativeElement.querySelector('button') as HTMLElement;
}

function menuPanel(): HTMLElement | null {
  return document.querySelector('[role="menu"]');
}

describe('MenuComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [OverlayModule] });
  });

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  function create() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('is closed initially and marks <med-menu> itself as hidden', () => {
    const fixture = create();
    expect(menuPanel()).toBeNull();
    // jsdom doesn't apply real CSS, so check the class rather than computed style.
    expect(fixture.nativeElement.querySelector('med-menu')!.className).toContain('hidden');
  });

  it('toggle() opens the menu on the first call and closes it on the second', () => {
    const fixture = create();
    trigger(fixture).click();
    fixture.detectChanges();
    expect(menuPanel()).not.toBeNull();

    trigger(fixture).click();
    fixture.detectChanges();
    expect(menuPanel()).toBeNull();
  });

  it('selecting an item closes the menu, calls its command(), and emits itemSelect', () => {
    const fixture = create();
    trigger(fixture).click();
    fixture.detectChanges();

    menuPanel()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    menuPanel()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(menuPanel()).toBeNull();
    expect(fixture.componentInstance.deleteSpy).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.selected).toEqual([{ label: 'Delete', command: fixture.componentInstance.deleteSpy }]);
  });

  it('isOpen reflects the current state', () => {
    const fixture = create();
    expect(fixture.componentInstance.menu.isOpen).toBe(false);

    trigger(fixture).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.menu.isOpen).toBe(true);
  });

  it('closes on Escape', () => {
    const fixture = create();
    trigger(fixture).click();
    fixture.detectChanges();

    menuPanel()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(menuPanel()).toBeNull();
  });

  it('moves focus into the panel on open and restores it to the trigger on close (OverlayService focus management, wired correctly by Menu)', () => {
    const fixture = create();
    const triggerEl = trigger(fixture);
    triggerEl.focus();
    expect(document.activeElement).toBe(triggerEl);

    triggerEl.click();
    fixture.detectChanges();
    expect(document.activeElement).toBe(menuPanel());

    fixture.componentInstance.menu.close();
    fixture.detectChanges();
    expect(document.activeElement).toBe(triggerEl);
  });

  it('destroying the host while the menu is open closes the overlay', () => {
    const fixture = create();
    trigger(fixture).click();
    fixture.detectChanges();
    expect(menuPanel()).not.toBeNull();

    fixture.destroy();

    expect(menuPanel()).toBeNull();
  });
});

describe('MenuComponent popup=false (inline mode)', () => {
  @Component({
    standalone: true,
    imports: [MenuComponent],
    template: `<med-menu [items]="items" [popup]="false" (itemSelect)="onItemSelect($event)" />`,
  })
  class InlineHostComponent {
    deleteSpy = jest.fn();
    items: MenuItem[] = [{ label: 'Rename' }, { label: 'Delete', command: this.deleteSpy }];
    selected: MenuItem[] = [];
    onItemSelect(item: MenuItem): void {
      this.selected.push(item);
    }
  }

  function menuPanel(): HTMLElement | null {
    return document.querySelector('[role="menu"]');
  }

  function create() {
    const fixture = TestBed.createComponent(InlineHostComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('renders the menu inline (no overlay, no trigger needed) as soon as it is created', () => {
    const fixture = create();
    expect(menuPanel()).not.toBeNull();
    expect(document.querySelectorAll('.cdk-overlay-container [role="menu"]')).toHaveLength(0);
  });

  it('does not steal focus from the page on render, unlike a real popup', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    create();

    expect(document.activeElement).toBe(input);
    input.remove();
  });

  it('activating an item calls command() and emits itemSelect, same as popup mode', () => {
    const fixture = create();
    menuPanel()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    menuPanel()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.deleteSpy).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.selected).toHaveLength(1);
    expect(menuPanel()).not.toBeNull(); // stays rendered, an inline menu never "closes"
  });

  it('open()/toggle()/close() are no-ops, isOpen stays false', () => {
    const fixture = create();
    const menu = fixture.debugElement.query((de) => de.componentInstance instanceof MenuComponent).componentInstance as MenuComponent;

    expect(menu.isOpen).toBe(false);
    menu.toggle(document.createElement('button'));
    fixture.detectChanges();

    expect(menu.isOpen).toBe(false);
    expect(document.querySelectorAll('[role="menu"]')).toHaveLength(1); // still just the inline one
  });
});

describe('MenuComponent grouping', () => {
  @Component({
    standalone: true,
    imports: [MenuComponent],
    template: `<med-menu [items]="groups" [popup]="false" (itemSelect)="onItemSelect($event)" />`,
  })
  class GroupedHostComponent {
    renameSpy = jest.fn();
    groups: MenuItemGroup[] = [
      { label: 'File', items: [{ label: 'Rename', command: this.renameSpy }, { label: 'Delete' }] },
      { label: 'Edit', items: [{ label: 'Undo' }, { label: 'Redo', disabled: true }] },
    ];
    selected: MenuItem[] = [];
    onItemSelect(item: MenuItem): void {
      this.selected.push(item);
    }
  }

  function menuList(): HTMLElement {
    return document.querySelector('[role="menu"]') as HTMLElement;
  }

  function create() {
    const fixture = TestBed.createComponent(GroupedHostComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('renders a labeled header row per group, followed by that group\'s items', () => {
    create();
    const rows = Array.from(menuList().children).map((el) => el.textContent?.trim());
    expect(rows).toEqual(['File', 'Rename', 'Delete', 'Edit', 'Undo', 'Redo']);
  });

  it('every item still gets role="menuitem"; only the header row is role="none"', () => {
    create();
    expect(menuList().querySelectorAll('[role="menuitem"]')).toHaveLength(4);
    expect(menuList().querySelectorAll('[role="none"]')).toHaveLength(2);
  });

  it('Home/End and Arrow keys move across group boundaries seamlessly (one shared keyboard scope)', () => {
    const fixture = create();
    // activeIndex starts at the first enabled item overall: Rename (flat index 0).
    menuList().dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    // Redo (last item) is disabled, so End lands on the last *enabled* item: Undo.
    expect(menuList().getAttribute('aria-activedescendant')).toMatch(/item-2$/); // Undo is flat index 2
  });

  it('activating an item in a group calls its command() and emits itemSelect', () => {
    const fixture = create();
    menuList().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.renameSpy).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.selected).toEqual([{ label: 'Rename', command: fixture.componentInstance.renameSpy }]);
  });

  it('a flat MenuItem[] (ungrouped) renders no header rows, unchanged from before', () => {
    @Component({
      standalone: true,
      imports: [MenuComponent],
      template: `<med-menu [items]="items" [popup]="false" />`,
    })
    class FlatHostComponent {
      items: MenuItem[] = [{ label: 'Rename' }, { label: 'Delete' }];
    }
    TestBed.createComponent(FlatHostComponent).detectChanges();
    expect(document.querySelectorAll('[role="none"]')).toHaveLength(0);
    expect(Array.from(document.querySelector('[role="menu"]')!.children).map((el) => el.textContent?.trim())).toEqual(['Rename', 'Delete']);
  });
});

// @scenario UI-007.S1
describe('MenuComponent #start, #end and #item templates (Wave 2)', () => {
  @Component({
    standalone: true,
    imports: [MenuComponent],
    template: `
      <med-menu [items]="items" [popup]="false">
        <ng-template #start>
          <div class="menu-start">Header</div>
        </ng-template>
        <ng-template #item let-item>
          <span class="custom-menu-item">* {{ item.label }}</span>
        </ng-template>
        <ng-template #end>
          <div class="menu-end">Footer</div>
        </ng-template>
      </med-menu>
    `,
  })
  class TemplatedMenuHostComponent {
    items: MenuItem[] = [{ label: 'Profile' }, { label: 'Logout' }];
  }

  it('renders #start, #item and #end templates in inline mode', () => {
    const fixture = TestBed.createComponent(TemplatedMenuHostComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.menu-start')?.textContent).toBe('Header');
    expect(fixture.nativeElement.querySelector('.menu-end')?.textContent).toBe('Footer');
    const customItems = Array.from(fixture.nativeElement.querySelectorAll('.custom-menu-item')).map((el) => (el as HTMLElement).textContent);
    expect(customItems).toEqual(['* Profile', '* Logout']);
  });
});
