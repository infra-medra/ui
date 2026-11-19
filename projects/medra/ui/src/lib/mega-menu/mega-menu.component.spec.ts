import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { MegaMenuComponent } from './mega-menu.component';
import { MegaMenuItem } from './mega-menu.types';
import { MenuItem } from '../menu/menu.types';

@Component({
  standalone: true,
  imports: [MegaMenuComponent],
  template: `<med-mega-menu [items]="items" (itemSelect)="onItemSelect($event)" />`,
})
class HostComponent {
  laptopsSpy = jest.fn();
  items: MegaMenuItem[] = [
    {
      label: 'Products',
      columns: [
        { header: 'Computers', items: [{ label: 'Laptops', command: this.laptopsSpy }, { label: 'Desktops' }] },
        { header: 'Accessories', items: [{ label: 'Keyboards' }, { label: 'Mice', disabled: true }] },
      ],
    },
    { label: 'About' },
  ];
  selected: MenuItem[] = [];

  onItemSelect(item: MenuItem): void {
    this.selected.push(item);
  }
}

function topButtons(fixture: { nativeElement: HTMLElement }): HTMLButtonElement[] {
  // Scoped to the item list, excluding the standalone mobile hamburger toggle button.
  return Array.from(fixture.nativeElement.querySelectorAll('nav ul button'));
}

function panel(): HTMLElement | null {
  return document.querySelector('[role="menu"]');
}

function panelItems(): HTMLElement[] {
  return Array.from(panel()?.querySelectorAll('[role="menuitem"]') ?? []);
}

function keydown(el: HTMLElement, key: string) {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

describe('MegaMenuComponent', () => {
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

  it('opens the columns panel on clicking a top item with columns', () => {
    const fixture = create();
    topButtons(fixture)[0].click();
    fixture.detectChanges();
    expect(panelItems().map((el) => el.textContent?.trim())).toEqual(['Laptops', 'Desktops', 'Keyboards', 'Mice']);
  });

  it('renders each column header', () => {
    const fixture = create();
    topButtons(fixture)[0].click();
    fixture.detectChanges();
    expect(panel()!.textContent).toContain('Computers');
    expect(panel()!.textContent).toContain('Accessories');
  });

  it('each column list is a role="group" whose aria-labelledby points at its own header element', () => {
    const fixture = create();
    topButtons(fixture)[0].click();
    fixture.detectChanges();

    const groups = Array.from(panel()!.querySelectorAll('[role="group"]'));
    expect(groups).toHaveLength(2);

    const [computersGroup, accessoriesGroup] = groups;
    const computersHeaderId = computersGroup.getAttribute('aria-labelledby');
    const accessoriesHeaderId = accessoriesGroup.getAttribute('aria-labelledby');
    expect(computersHeaderId).toBeTruthy();
    expect(accessoriesHeaderId).toBeTruthy();
    expect(computersHeaderId).not.toBe(accessoriesHeaderId);
    expect(document.getElementById(computersHeaderId!)?.textContent?.trim()).toBe('Computers');
    expect(document.getElementById(accessoriesHeaderId!)?.textContent?.trim()).toBe('Accessories');
  });

  it('a top item without columns runs its command directly, no panel opens', () => {
    const fixture = create();
    topButtons(fixture)[1].click();
    fixture.detectChanges();
    expect(panel()).toBeNull();
  });

  it('ArrowDown/Up move within the current column, wrapping', () => {
    const fixture = create();
    topButtons(fixture)[0].click();
    fixture.detectChanges();

    keydown(panel()!, 'ArrowDown'); // Laptops -> Desktops
    fixture.detectChanges();
    keydown(panel()!, 'Enter');
    fixture.detectChanges();
    expect(fixture.componentInstance.selected).toEqual([{ label: 'Desktops' }]);
  });

  it('ArrowRight moves to the neighboring column, landing near the same row', () => {
    const fixture = create();
    topButtons(fixture)[0].click();
    fixture.detectChanges();

    keydown(panel()!, 'ArrowRight'); // from Laptops (col 0, row 0) -> col 1, row 0 (Keyboards, since Mice is disabled it'd skip anyway)
    fixture.detectChanges();
    keydown(panel()!, 'Enter');
    fixture.detectChanges();
    expect(fixture.componentInstance.selected).toEqual([{ label: 'Keyboards' }]);
  });

  it('ArrowLeft moves to the neighboring column (wrapping from the first), landing near the same row', () => {
    const fixture = create();
    topButtons(fixture)[0].click();
    fixture.detectChanges();

    // From Laptops (col 0, row 0), ArrowLeft wraps to the last column -> Keyboards (Mice is disabled, so it lands there).
    keydown(panel()!, 'ArrowLeft');
    fixture.detectChanges();
    keydown(panel()!, 'Enter');
    fixture.detectChanges();
    expect(fixture.componentInstance.selected).toEqual([{ label: 'Keyboards' }]);
  });

  it('ArrowRight then ArrowLeft returns to the original column and row', () => {
    const fixture = create();
    topButtons(fixture)[0].click();
    fixture.detectChanges();

    keydown(panel()!, 'ArrowRight'); // col 0 -> col 1 (Keyboards)
    fixture.detectChanges();
    keydown(panel()!, 'ArrowLeft'); // col 1 -> col 0 (Laptops)
    fixture.detectChanges();
    keydown(panel()!, 'Enter');
    fixture.detectChanges();
    expect(fixture.componentInstance.selected).toEqual([{ label: 'Laptops', command: fixture.componentInstance.laptopsSpy }]);
  });

  it('Home jumps to the first enabled row, End jumps to the last enabled row, within the current column', () => {
    const fixture = create();
    topButtons(fixture)[0].click();
    fixture.detectChanges();

    keydown(panel()!, 'End'); // Laptops (row 0) -> Desktops (row 1, last enabled row in column 0)
    fixture.detectChanges();
    keydown(panel()!, 'Enter');
    fixture.detectChanges();
    expect(fixture.componentInstance.selected).toEqual([{ label: 'Desktops' }]);
  });

  it('Home returns to the first enabled row after moving away from it', () => {
    const fixture = create();
    topButtons(fixture)[0].click();
    fixture.detectChanges();

    keydown(panel()!, 'ArrowDown'); // Laptops -> Desktops
    fixture.detectChanges();
    keydown(panel()!, 'Home'); // Desktops -> back to Laptops
    fixture.detectChanges();
    keydown(panel()!, 'Enter');
    fixture.detectChanges();
    expect(fixture.componentInstance.selected).toEqual([{ label: 'Laptops', command: fixture.componentInstance.laptopsSpy }]);
  });

  it('disabled items are skipped by keyboard navigation and never activate', () => {
    const fixture = create();
    topButtons(fixture)[0].click();
    fixture.detectChanges();
    keydown(panel()!, 'ArrowRight'); // move to Accessories column, active = Keyboards
    keydown(panel()!, 'ArrowDown'); // would be Mice (disabled) -> wraps back to Keyboards, the only enabled row
    fixture.detectChanges();
    keydown(panel()!, 'Enter');
    fixture.detectChanges();
    expect(fixture.componentInstance.selected).toEqual([{ label: 'Keyboards' }]);
  });

  it('clicking an item calls its command(), emits itemSelect, and closes the panel', () => {
    const fixture = create();
    topButtons(fixture)[0].click();
    fixture.detectChanges();
    panelItems()[0].dispatchEvent(new Event('pointerdown', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.laptopsSpy).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.selected).toEqual([{ label: 'Laptops', command: fixture.componentInstance.laptopsSpy }]);
    expect(panel()).toBeNull();
  });

  it('clicking the same top item again closes the panel (toggle)', () => {
    const fixture = create();
    const btn = topButtons(fixture)[0];
    btn.click();
    fixture.detectChanges();
    expect(panel()).not.toBeNull();

    btn.click();
    fixture.detectChanges();
    expect(panel()).toBeNull();
  });

  it('closes on Escape', () => {
    const fixture = create();
    topButtons(fixture)[0].click();
    fixture.detectChanges();
    keydown(panel()!, 'Escape');
    fixture.detectChanges();
    expect(panel()).toBeNull();
  });

  it('destroying the host while open closes the overlay', () => {
    const fixture = create();
    topButtons(fixture)[0].click();
    fixture.detectChanges();
    expect(panel()).not.toBeNull();
    fixture.destroy();
    expect(panel()).toBeNull();
  });

  describe('url/target/badge', () => {
    @Component({
      standalone: true,
      imports: [MegaMenuComponent],
      template: `<med-mega-menu [items]="items" />`,
    })
    class UrlHostComponent {
      items: MegaMenuItem[] = [
        { label: 'Docs', url: 'https://example.com/docs', target: '_blank' },
        {
          label: 'Products',
          columns: [{ items: [{ label: 'Laptops', url: 'https://example.com/laptops', badge: 'New' }] }],
        },
      ];
    }

    it('renders a top-level leaf item with url as a real <a href>', () => {
      const fixture = TestBed.createComponent(UrlHostComponent);
      fixture.detectChanges();
      const link = fixture.nativeElement.querySelector('nav a') as HTMLAnchorElement;
      expect(link.getAttribute('href')).toBe('https://example.com/docs');
      expect(link.getAttribute('target')).toBe('_blank');
    });

    it('renders a column item with url as a real <a href>, with a badge alongside it', () => {
      const fixture = TestBed.createComponent(UrlHostComponent);
      fixture.detectChanges();
      topButtons(fixture)[0].click();
      fixture.detectChanges();

      const link = panel()!.querySelector('a') as HTMLAnchorElement;
      expect(link.getAttribute('href')).toBe('https://example.com/laptops');
      expect(panelItems()[0].textContent).toContain('New');
    });
  });

  describe('responsive collapse', () => {
    function hamburger(fixture: { nativeElement: HTMLElement }): HTMLButtonElement {
      return fixture.nativeElement.querySelector('nav > button') as HTMLButtonElement;
    }

    function list(fixture: { nativeElement: HTMLElement }): HTMLElement {
      return fixture.nativeElement.querySelector('nav ul') as HTMLElement;
    }

    it('the item list is hidden by default until toggled open', () => {
      const fixture = create();
      expect(list(fixture).className).toContain('hidden');
      expect(hamburger(fixture).getAttribute('aria-expanded')).toBe('false');
    });

    it('clicking the hamburger reveals the list and flips the icon/label', () => {
      const fixture = create();
      hamburger(fixture).click();
      fixture.detectChanges();

      expect(list(fixture).className).not.toContain('hidden');
      expect(hamburger(fixture).getAttribute('aria-expanded')).toBe('true');
      expect(hamburger(fixture).getAttribute('aria-label')).toBe('Close menu');
    });

    it('selecting a top-level leaf item closes the mobile menu', () => {
      const fixture = create();
      hamburger(fixture).click();
      fixture.detectChanges();

      topButtons(fixture)[1].click(); // "About", a leaf item
      fixture.detectChanges();

      expect(list(fixture).className).toContain('hidden');
    });
  });

  describe('#item/#start/#end', () => {
    @Component({
      standalone: true,
      imports: [MegaMenuComponent],
      template: `
        <med-mega-menu [items]="items">
          <ng-template #start>
            <span class="start-marker">Logo</span>
          </ng-template>
          <ng-template #item let-menuItem>
            <span class="item-marker">{{ menuItem.label }}!!</span>
          </ng-template>
          <ng-template #end>
            <span class="end-marker">Search</span>
          </ng-template>
        </med-mega-menu>
      `,
    })
    class TemplatesHostComponent {
      items: MegaMenuItem[] = [{ label: 'Products' }, { label: 'About' }];
    }

    function templatesFixture() {
      const fixture = TestBed.createComponent(TemplatesHostComponent);
      fixture.detectChanges();
      return fixture;
    }

    it('renders the default item content (label only, no marker) when no #item template is projected', () => {
      const fixture = create();
      expect(fixture.nativeElement.querySelector('.item-marker')).toBeNull();
      expect(topButtons(fixture)[0].textContent).toContain('Products');
    });

    it('renders no #start/#end wrapper when neither template is projected', () => {
      const fixture = create();
      expect(fixture.nativeElement.querySelector('.start-marker')).toBeNull();
      expect(fixture.nativeElement.querySelector('.end-marker')).toBeNull();
    });

    it('renders the projected #item template with the item as context, for every top-level item', () => {
      const fixture = templatesFixture();
      const markers = Array.from(fixture.nativeElement.querySelectorAll('.item-marker')) as HTMLElement[];
      expect(markers.map((el) => el.textContent)).toEqual(['Products!!', 'About!!']);
    });

    it('renders the projected #start/#end templates before/after the item list', () => {
      const fixture = templatesFixture();
      expect(fixture.nativeElement.querySelector('.start-marker')?.textContent).toBe('Logo');
      expect(fixture.nativeElement.querySelector('.end-marker')?.textContent).toBe('Search');
    });
  });
});
