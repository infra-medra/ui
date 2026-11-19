import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { MenubarComponent } from './menubar.component';
import { MenubarItem } from './menubar.types';

function topButtons(fixture: { nativeElement: HTMLElement }): HTMLButtonElement[] {
  // Scoped to the item list, excluding the standalone mobile hamburger toggle button.
  return Array.from(fixture.nativeElement.querySelectorAll('ul button'));
}

function submenuPanel(): HTMLElement | null {
  return document.querySelector('[role="menu"]');
}

function nav(fixture: { nativeElement: HTMLElement }): HTMLElement {
  return fixture.nativeElement.querySelector('nav') as HTMLElement;
}

describe('MenubarComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [OverlayModule] });
  });

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  const homeSpy = jest.fn();
  const renameSpy = jest.fn();
  const ITEMS: MenubarItem[] = [
    { label: 'Home', command: homeSpy },
    {
      label: 'File',
      items: [{ label: 'Rename', command: renameSpy }, { label: 'Delete' }],
    },
    { label: 'Disabled', disabled: true },
  ];

  function create() {
    const fixture = TestBed.createComponent(MenubarComponent);
    fixture.componentRef.setInput('items', ITEMS);
    fixture.detectChanges();
    return fixture;
  }

  it('renders one button per top-level item', () => {
    const fixture = create();
    expect(topButtons(fixture).map((b) => b.textContent?.trim())).toEqual(['Home', 'File', 'Disabled']);
  });

  it('clicking a leaf item calls its command() and emits itemSelect, without opening a submenu', () => {
    const fixture = create();
    const received: unknown[] = [];
    fixture.componentInstance.itemSelect.subscribe((item) => received.push(item));

    topButtons(fixture)[0].click();
    fixture.detectChanges();

    expect(homeSpy).toHaveBeenCalledTimes(1);
    expect(received).toEqual([ITEMS[0]]);
    expect(submenuPanel()).toBeNull();
  });

  it('clicking an item with children opens its dropdown instead of calling a command', () => {
    const fixture = create();
    topButtons(fixture)[1].click();
    fixture.detectChanges();

    expect(submenuPanel()).not.toBeNull();
    expect(submenuPanel()!.textContent).toContain('Rename');
    expect(topButtons(fixture)[1].getAttribute('aria-expanded')).toBe('true');
  });

  it('clicking the same dropdown trigger again closes it', () => {
    const fixture = create();
    topButtons(fixture)[1].click();
    fixture.detectChanges();
    expect(submenuPanel()).not.toBeNull();

    topButtons(fixture)[1].click();
    fixture.detectChanges();
    expect(submenuPanel()).toBeNull();
    expect(topButtons(fixture)[1].getAttribute('aria-expanded')).toBe('false');
  });

  it('opening a different dropdown closes the previously open one', () => {
    const fixture = create();
    topButtons(fixture)[1].click();
    fixture.detectChanges();
    expect(submenuPanel()).not.toBeNull();

    // "Home" has no children, but clicking it should still tear down File's open submenu.
    topButtons(fixture)[0].click();
    fixture.detectChanges();

    expect(submenuPanel()).toBeNull();
    expect(topButtons(fixture)[1].getAttribute('aria-expanded')).toBe('false');
  });

  it('selecting a dropdown item calls its command, emits itemSelect, and closes the dropdown', () => {
    const fixture = create();
    const received: unknown[] = [];
    fixture.componentInstance.itemSelect.subscribe((item) => received.push(item));

    topButtons(fixture)[1].click();
    fixture.detectChanges();
    submenuPanel()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(renameSpy).toHaveBeenCalledTimes(1);
    expect(received).toEqual([ITEMS[1].items![0]]);
    expect(submenuPanel()).toBeNull();
  });

  it('closes on Escape', () => {
    const fixture = create();
    topButtons(fixture)[1].click();
    fixture.detectChanges();
    expect(submenuPanel()).not.toBeNull();

    submenuPanel()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(submenuPanel()).toBeNull();
    expect(topButtons(fixture)[1].getAttribute('aria-expanded')).toBe('false');
  });

  it('defaults the <nav> aria-label to "Menu bar" and honors a custom ariaLabel input', () => {
    const fixture = create();
    expect(nav(fixture).getAttribute('aria-label')).toBe('Menu bar');

    fixture.componentRef.setInput('ariaLabel', 'Primary navigation');
    fixture.detectChanges();
    expect(nav(fixture).getAttribute('aria-label')).toBe('Primary navigation');
  });

  it('never opens a submenu or calls a command for a disabled top-level item', () => {
    const fixture = create();
    topButtons(fixture)[2].click();
    fixture.detectChanges();

    expect(submenuPanel()).toBeNull();
  });

  it('a top-level item without children has no aria-haspopup/aria-expanded', () => {
    const fixture = create();
    expect(topButtons(fixture)[0].getAttribute('aria-haspopup')).toBeNull();
    expect(topButtons(fixture)[0].getAttribute('aria-expanded')).toBeNull();
  });

  it('destroying the component while a submenu is open closes the overlay', () => {
    const fixture = create();
    topButtons(fixture)[1].click();
    fixture.detectChanges();
    expect(submenuPanel()).not.toBeNull();

    fixture.destroy();

    expect(submenuPanel()).toBeNull();
  });

  describe('url/target/badge', () => {
    function create(items: MenubarItem[]) {
      const fixture = TestBed.createComponent(MenubarComponent);
      fixture.componentRef.setInput('items', items);
      fixture.detectChanges();
      return fixture;
    }

    it('renders a leaf item with url as a real <a href>, with target when given', () => {
      const fixture = create([{ label: 'Docs', url: 'https://example.com/docs', target: '_blank' }]);
      const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
      expect(link).not.toBeNull();
      expect(link.getAttribute('href')).toBe('https://example.com/docs');
      expect(link.getAttribute('target')).toBe('_blank');
      expect(fixture.nativeElement.querySelector('ul button')).toBeNull();
    });

    it('an item with children never becomes an <a>, even with a url set', () => {
      const fixture = create([{ label: 'File', url: 'https://example.com', items: [{ label: 'New' }] }]);
      expect(fixture.nativeElement.querySelector('a')).toBeNull();
      expect(fixture.nativeElement.querySelector('ul button')).not.toBeNull();
    });

    it('a disabled item with url renders as a real disabled <button>, never a clickable <a>', () => {
      const fixture = create([{ label: 'Docs', url: 'https://example.com/docs', disabled: true }]);
      expect(fixture.nativeElement.querySelector('a')).toBeNull();
      expect((fixture.nativeElement.querySelector('ul button') as HTMLButtonElement).disabled).toBe(true);
    });

    it('a url item still calls command() and emits itemSelect on click, same as any other leaf item', () => {
      const command = jest.fn();
      const fixture = create([{ label: 'Docs', url: 'https://example.com/docs', command }]);
      const received: MenubarItem[] = [];
      fixture.componentInstance.itemSelect.subscribe((item) => received.push(item));

      (fixture.nativeElement.querySelector('a') as HTMLAnchorElement).click();

      expect(command).toHaveBeenCalledTimes(1);
      expect(received).toHaveLength(1);
    });

    it('renders a badge next to a top-level item label', () => {
      const fixture = create([{ label: 'Inbox', badge: '3' }]);
      expect(topButtons(fixture)[0].textContent).toContain('Inbox');
      expect(topButtons(fixture)[0].textContent).toContain('3');
    });
  });

  describe('ArrowLeft/ArrowRight roving tabindex', () => {
    function keydown(el: HTMLElement, key: string) {
      el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    }

    it('only the first enabled item has tabindex 0 initially', () => {
      const fixture = create();
      expect(topButtons(fixture).map((b) => b.tabIndex)).toEqual([0, -1, -1]);
    });

    it('ArrowRight moves the roving stop to the next item and focuses it', () => {
      const fixture = create();
      keydown(topButtons(fixture)[0], 'ArrowRight');
      fixture.detectChanges();
      expect(document.activeElement).toBe(topButtons(fixture)[1]);
      expect(topButtons(fixture).map((b) => b.tabIndex)).toEqual([-1, 0, -1]);
    });

    it('ArrowRight skips a disabled item and wraps around', () => {
      const fixture = create();
      keydown(topButtons(fixture)[1], 'ArrowRight'); // File(1) -> Disabled(2) skipped -> Home(0)
      fixture.detectChanges();
      expect(document.activeElement).toBe(topButtons(fixture)[0]);
    });

    it('ArrowLeft wraps from the first item to the last enabled one', () => {
      const fixture = create();
      keydown(topButtons(fixture)[0], 'ArrowLeft'); // Home(0) -> Disabled(2) skipped -> File(1)
      fixture.detectChanges();
      expect(document.activeElement).toBe(topButtons(fixture)[1]);
    });

    it('Home/End jump to the first/last enabled item', () => {
      const fixture = create();
      keydown(topButtons(fixture)[0], 'End');
      fixture.detectChanges();
      expect(document.activeElement).toBe(topButtons(fixture)[1]); // File is last enabled (Disabled is skipped)

      keydown(topButtons(fixture)[1], 'Home');
      fixture.detectChanges();
      expect(document.activeElement).toBe(topButtons(fixture)[0]);
    });

    it('arrow keys never open a dropdown by themselves', () => {
      const fixture = create();
      keydown(topButtons(fixture)[0], 'ArrowRight'); // moves onto "File", which has children
      fixture.detectChanges();
      expect(submenuPanel()).toBeNull();
    });
  });

  describe('responsive collapse', () => {
    function hamburger(fixture: { nativeElement: HTMLElement }): HTMLButtonElement {
      return fixture.nativeElement.querySelector('nav > button') as HTMLButtonElement;
    }

    function list(fixture: { nativeElement: HTMLElement }): HTMLElement {
      return fixture.nativeElement.querySelector('ul') as HTMLElement;
    }

    it('the item list is hidden by default (mobile-first) until toggled open', () => {
      const fixture = create();
      expect(list(fixture).className).toContain('hidden');
      expect(hamburger(fixture).getAttribute('aria-expanded')).toBe('false');
      expect(hamburger(fixture).getAttribute('aria-label')).toBe('Open menu');
    });

    it('clicking the hamburger reveals the list and flips the icon/label', () => {
      const fixture = create();
      hamburger(fixture).click();
      fixture.detectChanges();

      expect(list(fixture).className).not.toContain('hidden');
      expect(list(fixture).className).toContain('flex-col');
      expect(hamburger(fixture).getAttribute('aria-expanded')).toBe('true');
      expect(hamburger(fixture).getAttribute('aria-label')).toBe('Close menu');
    });

    it('the list always includes sm:flex, so it stays visible from the sm breakpoint up regardless of toggle state', () => {
      const fixture = create();
      expect(list(fixture).className).toContain('sm:flex');
      expect(list(fixture).className).toContain('sm:flex-row');
    });

    it('selecting a leaf item closes the mobile menu', () => {
      const fixture = create();
      hamburger(fixture).click();
      fixture.detectChanges();
      expect(list(fixture).className).not.toContain('hidden');

      topButtons(fixture)[0].click(); // "Home", a leaf item
      fixture.detectChanges();

      expect(list(fixture).className).toContain('hidden');
    });

    it('the hamburger button is aria-controls-linked to the list by id', () => {
      const fixture = create();
      expect(hamburger(fixture).getAttribute('aria-controls')).toBe(list(fixture).id);
    });
  });

  // @scenario UI-007.S1
  describe('#start, #end, #item templates and breakpoint (Wave 2)', () => {
    @Component({
      standalone: true,
      imports: [MenubarComponent],
      template: `
        <med-menubar [items]="items" [breakpoint]="breakpoint">
          <ng-template #start>
            <span class="menubar-start">Logo</span>
          </ng-template>
          <ng-template #item let-item>
            <span class="custom-menubar-item">[{{ item.label }}]</span>
          </ng-template>
          <ng-template #end>
            <span class="menubar-end">User</span>
          </ng-template>
        </med-menubar>
      `,
    })
    class TemplatedMenubarHostComponent {
      items: MenubarItem[] = [{ label: 'Home' }, { label: 'Docs' }];
      breakpoint = 'lg';
    }

    it('renders #start, #item and #end templates and applies breakpoint', () => {
      const fixture = TestBed.createComponent(TemplatedMenubarHostComponent);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.menubar-start')?.textContent).toBe('Logo');
      expect(fixture.nativeElement.querySelector('.menubar-end')?.textContent).toBe('User');
      const items = Array.from(fixture.nativeElement.querySelectorAll('.custom-menubar-item')).map((el) => (el as HTMLElement).textContent);
      expect(items).toEqual(['[Home]', '[Docs]']);

      const ul = fixture.nativeElement.querySelector('ul') as HTMLElement;
      const toggle = fixture.nativeElement.querySelector('nav > button') as HTMLButtonElement;
      expect(ul.className).toContain('lg:flex');
      expect(toggle.className).toContain('lg:hidden');
      expect(fixture.nativeElement.querySelector('nav')?.getAttribute('data-breakpoint')).toBe('lg');
    });
  });
});
