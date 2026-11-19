import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IconComponent } from '../icon/icon.component';
import { BreadcrumbComponent } from './breadcrumb.component';
import { BreadcrumbHomeItem, BreadcrumbItem } from './breadcrumb.types';

const ITEMS: BreadcrumbItem[] = [
  { label: 'Home', url: '/', icon: 'home' },
  { label: 'Settings', url: '/settings' },
  { label: 'Disabled step', url: '/nope', disabled: true },
  { label: 'Profile' },
];

function create(items: readonly BreadcrumbItem[] = ITEMS) {
  const fixture = TestBed.createComponent(BreadcrumbComponent);
  fixture.componentRef.setInput('items', items);
  fixture.detectChanges();
  return fixture;
}

describe('BreadcrumbComponent', () => {
  it('renders one <li> per item, in order', () => {
    const fixture = create();
    const labels = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('li')).map((li: Element) => li.textContent?.trim());
    expect(labels).toEqual(['Home', 'Settings', 'Disabled step', 'Profile']);
  });

  it('renders non-last, enabled items as real links with the given href', () => {
    const fixture = create();
    const homeLink = fixture.nativeElement.querySelector('a[href="/"]');
    const settingsLink = fixture.nativeElement.querySelector('a[href="/settings"]');
    expect(homeLink).not.toBeNull();
    expect(settingsLink).not.toBeNull();
  });

  it('renders a disabled item as non-link text with aria-disabled', () => {
    const fixture = create();
    const items = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('li')) as HTMLElement[];
    const disabledItem = items[2];
    expect(disabledItem.querySelector('a')).toBeNull();
    expect(disabledItem.querySelector('span')?.getAttribute('aria-disabled')).toBe('true');
  });

  it('always renders the last item as non-link text with aria-current="page", even if it has no url', () => {
    const fixture = create();
    const items = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('li')) as HTMLElement[];
    const lastItem = items[items.length - 1];
    expect(lastItem.querySelector('a')).toBeNull();
    expect(lastItem.querySelector('span')?.getAttribute('aria-current')).toBe('page');
  });

  it('does not mark non-last items as the current page', () => {
    const fixture = create();
    const items = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('li')) as HTMLElement[];
    expect(items[0].querySelector('[aria-current]')).toBeNull();
  });

  it('emits itemSelect with the item and native event when a link is clicked', () => {
    const fixture = create();
    const received: unknown[] = [];
    fixture.componentInstance.itemSelect.subscribe((payload) => received.push(payload));

    const homeLink = fixture.nativeElement.querySelector('a[href="/"]') as HTMLAnchorElement;
    homeLink.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    expect(received).toHaveLength(1);
    expect((received[0] as { item: BreadcrumbItem }).item).toEqual(ITEMS[0]);
  });

  it('draws a separator icon between items but not after the last one', () => {
    const fixture = create();
    const separators = (fixture.nativeElement as HTMLElement).querySelectorAll('med-icon[name="chevron-right"]');
    expect(separators.length).toBe(ITEMS.length - 1);
  });

  it('renders an item icon when provided', () => {
    const fixture = create();
    // "Home" has an icon (item icon + the chevron separator after it = 2);
    // "Settings" has none (just the chevron separator = 1).
    const items = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('li')) as HTMLElement[];
    expect(items[0].querySelectorAll('med-icon').length).toBe(2);
    expect(items[1].querySelectorAll('med-icon').length).toBe(1);
  });

  it('uses a custom aria-label', () => {
    const fixture = create();
    fixture.componentRef.setInput('ariaLabel', 'Trilha de navegação');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('nav')?.getAttribute('aria-label')).toBe('Trilha de navegação');
  });

  it('merges a consumer class override onto the list', () => {
    const fixture = create();
    fixture.componentRef.setInput('class', 'gap-4');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('ol')?.className).toContain('gap-4');
  });

  it('forwards target to the rendered <a>', () => {
    const fixture = create([{ label: 'External', url: 'https://example.com', target: '_blank' }, { label: 'Here' }]);
    expect(fixture.nativeElement.querySelector('a')?.getAttribute('target')).toBe('_blank');
  });

  describe('visible: false', () => {
    const WITH_HIDDEN: BreadcrumbItem[] = [{ label: 'A', url: '/a' }, { label: 'B', url: '/b', visible: false }, { label: 'C' }];

    it('is filtered out entirely — no <li> for it', () => {
      const fixture = create(WITH_HIDDEN);
      const labels = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('li')).map((li: Element) => li.textContent?.trim());
      expect(labels).toEqual(['A', 'C']);
    });

    it('the true last VISIBLE item gets aria-current="page", not the last array entry', () => {
      const fixture = create([{ label: 'A', url: '/a' }, { label: 'B', visible: false }]);
      const items = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('li')) as HTMLElement[];
      expect(items).toHaveLength(1);
      expect(items[0].querySelector('span')?.getAttribute('aria-current')).toBe('page');
    });

    it('does not leave a dangling separator when the item right after it is hidden', () => {
      const fixture = create(WITH_HIDDEN);
      const separators = (fixture.nativeElement as HTMLElement).querySelectorAll('med-icon[name="chevron-right"]');
      expect(separators.length).toBe(1); // just between A and C
    });
  });

  describe('home', () => {
    it('renders no leading item when home is unset', () => {
      const fixture = create();
      expect((fixture.nativeElement as HTMLElement).querySelectorAll('li').length).toBe(ITEMS.length);
    });

    it('renders a leading icon-only link, defaulting to the "home" icon', () => {
      const fixture = create();
      fixture.componentRef.setInput('home', { url: '/' } satisfies BreadcrumbHomeItem);
      fixture.detectChanges();

      const items = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('li')) as HTMLElement[];
      expect(items).toHaveLength(ITEMS.length + 1);
      const homeLi = items[0];
      expect(homeLi.querySelector('a')?.getAttribute('href')).toBe('/');
      const homeIcon = fixture.debugElement.query(By.directive(IconComponent)).componentInstance as IconComponent;
      expect(homeIcon.name()).toBe('home');
      expect(homeLi.textContent?.trim()).toBe(''); // no label given
    });

    it('a custom icon overrides the "home" default, and a label renders alongside it', () => {
      const fixture = create();
      fixture.componentRef.setInput('home', { url: '/', icon: 'building-office', label: 'Company' } satisfies BreadcrumbHomeItem);
      fixture.detectChanges();

      const homeLi = fixture.nativeElement.querySelector('li') as HTMLElement;
      const homeIcon = fixture.debugElement.query(By.directive(IconComponent)).componentInstance as IconComponent;
      expect(homeIcon.name()).toBe('building-office');
      expect(homeLi.textContent?.trim()).toBe('Company');
    });

    it('a disabled home renders as non-link text with aria-disabled', () => {
      const fixture = create();
      fixture.componentRef.setInput('home', { url: '/', disabled: true } satisfies BreadcrumbHomeItem);
      fixture.detectChanges();

      const homeLi = fixture.nativeElement.querySelector('li') as HTMLElement;
      expect(homeLi.querySelector('a')).toBeNull();
      expect(homeLi.querySelector('span')?.getAttribute('aria-disabled')).toBe('true');
    });

    it('uses homeAriaLabel as the accessible name for an icon-only home link', () => {
      const fixture = create();
      fixture.componentRef.setInput('home', { url: '/' } satisfies BreadcrumbHomeItem);
      fixture.componentRef.setInput('homeAriaLabel', 'Início');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('li a')?.getAttribute('aria-label')).toBe('Início');
    });

    it('separates home from the first item with its own chevron', () => {
      const fixture = create();
      fixture.componentRef.setInput('home', { url: '/' } satisfies BreadcrumbHomeItem);
      fixture.detectChanges();

      const separators = (fixture.nativeElement as HTMLElement).querySelectorAll('med-icon[name="chevron-right"]');
      expect(separators.length).toBe(ITEMS.length); // one between home+first, plus the usual ITEMS.length - 1
    });

    it('renders no separator after home when items is empty', () => {
      const fixture = create([]);
      fixture.componentRef.setInput('home', { url: '/' } satisfies BreadcrumbHomeItem);
      fixture.detectChanges();

      expect((fixture.nativeElement as HTMLElement).querySelectorAll('med-icon[name="chevron-right"]').length).toBe(0);
    });

    it('clicking home emits itemSelect with the home item', () => {
      const fixture = create([]);
      const home: BreadcrumbHomeItem = { url: '/' };
      fixture.componentRef.setInput('home', home);
      fixture.detectChanges();

      const received: unknown[] = [];
      fixture.componentInstance.itemSelect.subscribe((payload) => received.push(payload));
      (fixture.nativeElement.querySelector('a') as HTMLAnchorElement).dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

      expect(received).toHaveLength(1);
      expect((received[0] as { item: BreadcrumbHomeItem }).item).toEqual(home);
    });
  });
});

describe('BreadcrumbComponent (itemTemplate / separatorTemplate)', () => {
  @Component({
    standalone: true,
    imports: [BreadcrumbComponent],
    template: `
      <med-breadcrumb [items]="items" [home]="home">
        <ng-template #item let-crumb>
          <span class="custom-item">{{ crumb.label ?? 'home-icon' }}</span>
        </ng-template>
        <ng-template #separator>
          <span class="custom-separator">/</span>
        </ng-template>
      </med-breadcrumb>
    `,
  })
  class HostComponent {
    items: BreadcrumbItem[] = [{ label: 'A', url: '/a' }, { label: 'B' }];
    home: BreadcrumbHomeItem | null = null;
  }

  function createHost(configure?: (h: HostComponent) => void) {
    const fixture = TestBed.createComponent(HostComponent);
    configure?.(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
  }

  it('itemTemplate replaces the default icon+label content for every item, including home', () => {
    const fixture = createHost((h) => (h.home = { url: '/' }));

    const customItems = (fixture.nativeElement as HTMLElement).querySelectorAll('.custom-item');
    expect(customItems).toHaveLength(3); // home + A + B
    expect(Array.from(customItems).map((el) => (el as HTMLElement).textContent)).toEqual(['home-icon', 'A', 'B']);
  });

  it('itemTemplate keeps the real <a>/aria-current wrapper — only the inner content is replaced', () => {
    const fixture = createHost();
    const link = fixture.nativeElement.querySelector('a[href="/a"]');
    expect(link).not.toBeNull();
    expect(link?.querySelector('.custom-item')).not.toBeNull();

    const lastLi = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('li')).at(-1) as HTMLElement;
    expect(lastLi.querySelector('span[aria-current="page"]')).not.toBeNull();
  });

  // @scenario UI-007.S1
  it('separatorTemplate replaces the default chevron icon', () => {
    const fixture = createHost();
    expect(fixture.nativeElement.querySelector('med-icon[name="chevron-right"]')).toBeNull();
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('.custom-separator')).toHaveLength(1); // between A and B
  });
});
