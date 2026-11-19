import { APP_BASE_HREF } from '@angular/common';
import { Component, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationEnd, Router, provideRouter } from '@angular/router';
import { filter, firstValueFrom } from 'rxjs';
import {
  MED_MENU_LINK_STRATEGY,
  MegaMenuComponent,
  MenuComponent,
  MenuItem,
  MenubarComponent,
  PanelMenuComponent,
  TabMenuComponent,
  TieredMenuComponent,
} from '@medra.dev/ui';
import { provideMedraMenuRouterLinks } from './menu-router-links';

/**
 * UI-043 (routerLink) with the real Router and the real strategy from
 * `@medra.dev/ui/router`, in all six menu components. The threat-model cases
 * (M-01 hostile URLs, M-02 disabled items) live here too.
 */

@Component({ standalone: true, template: '' })
class PageComponent {}

interface Mounted {
  readonly fixture: ComponentFixture<unknown>;
  readonly root: HTMLElement;
}

interface Case {
  readonly name: string;
  readonly mount: (items: MenuItem[]) => Mounted;
}

function mountOf<T>(type: Type<T>, inputs: Record<string, unknown>): Mounted {
  const fixture = TestBed.createComponent(type);
  for (const [key, value] of Object.entries(inputs)) {
    fixture.componentRef.setInput(key, value);
  }
  fixture.detectChanges();
  return { fixture, root: fixture.nativeElement as HTMLElement };
}

const CASES: Case[] = [
  { name: 'med-menu', mount: (items) => mountOf(MenuComponent, { popup: false, items }) },
  { name: 'med-menubar', mount: (items) => mountOf(MenubarComponent, { items }) },
  { name: 'med-mega-menu', mount: (items) => mountOf(MegaMenuComponent, { items }) },
  { name: 'med-panel-menu', mount: (items) => mountOf(PanelMenuComponent, { items }) },
  { name: 'med-tiered-menu', mount: (items) => mountOf(TieredMenuComponent, { popup: false, items }) },
  { name: 'med-tab-menu', mount: (items) => mountOf(TabMenuComponent, { items }) },
];

/** The innermost element that carries exactly this label. */
function labelEl(root: HTMLElement, label: string): HTMLElement {
  const el = Array.from(root.querySelectorAll<HTMLElement>('*')).find((node) => node.children.length === 0 && node.textContent?.trim() === label);
  if (!el) {
    throw new Error(`No element labeled "${label}"`);
  }
  return el;
}

function anchorOf(root: HTMLElement, label: string): HTMLAnchorElement | null {
  return labelEl(root, label).closest('a');
}

/**
 * Dispatches a click and reports whether the component's own handler
 * called `preventDefault()` — read at `document`, then cancelled so jsdom
 * never tries a real navigation.
 */
function click(el: HTMLElement, init: MouseEventInit = {}): { defaultPrevented: boolean } {
  let defaultPrevented = false;
  const onClick = (event: Event) => {
    defaultPrevented = event.defaultPrevented;
    event.preventDefault();
  };
  document.addEventListener('click', onClick, { once: true });
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init }));
  document.removeEventListener('click', onClick);
  return { defaultPrevented };
}

describe('menu routerLink with @medra.dev/ui/router', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: APP_BASE_HREF, useValue: '/' },
        provideRouter([
          { path: 'relatorios', component: PageComponent },
          { path: 'a', component: PageComponent },
          { path: '**', component: PageComponent },
        ]),
        provideMedraMenuRouterLinks(),
      ],
    });
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  describe.each(CASES)('$name', ({ mount }) => {
    it('UI-043.S2: renders the item as a real <a> whose href is the route', () => {
      const { root } = mount([{ label: 'Relatórios', routerLink: '/relatorios' }]);
      expect(anchorOf(root, 'Relatórios')?.getAttribute('href')).toBe('/relatorios');
    });

    it('UI-043.S2: resolves router commands to the same href', () => {
      const { root } = mount([{ label: 'Detalhe', routerLink: ['/relatorios', 5] }]);
      expect(anchorOf(root, 'Detalhe')?.getAttribute('href')).toBe('/relatorios/5');
    });

    it('UI-043.S1: a plain click navigates through the Router and cancels the native navigation', async () => {
      const { fixture, root } = mount([{ label: 'Relatórios', routerLink: '/relatorios' }]);
      const result = click(labelEl(root, 'Relatórios'));
      await fixture.whenStable();
      expect(result.defaultPrevented).toBe(true);
      expect(router.url).toBe('/relatorios');
    });

    it('UI-043.S3: Ctrl, Cmd, Shift and Alt clicks are left to the browser and the Router does not navigate', async () => {
      const { fixture, root } = mount([{ label: 'Relatórios', routerLink: '/relatorios' }]);
      for (const init of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }]) {
        expect(click(labelEl(root, 'Relatórios'), init).defaultPrevented).toBe(false);
      }
      await fixture.whenStable();
      expect(router.url).toBe('/');
    });

    it('UI-043.S3: a middle click is left to the browser', async () => {
      const { fixture, root } = mount([{ label: 'Relatórios', routerLink: '/relatorios' }]);
      expect(click(labelEl(root, 'Relatórios'), { button: 1 }).defaultPrevented).toBe(false);
      await fixture.whenStable();
      expect(router.url).toBe('/');
    });

    it('a target="_blank" item is left to the browser', async () => {
      const { fixture, root } = mount([{ label: 'Relatórios', routerLink: '/relatorios', target: '_blank' }]);
      expect(click(labelEl(root, 'Relatórios')).defaultPrevented).toBe(false);
      await fixture.whenStable();
      expect(router.url).toBe('/');
    });

    it('UI-043.S4: command is still called and the Router navigates', async () => {
      const command = jest.fn();
      const { fixture, root } = mount([{ label: 'Relatórios', routerLink: '/relatorios', command }]);
      click(labelEl(root, 'Relatórios'));
      await fixture.whenStable();
      expect(command).toHaveBeenCalledTimes(1);
      expect(router.url).toBe('/relatorios');
    });

    it('UI-043.S5: routerLink wins over url', () => {
      const { root } = mount([{ label: 'Relatórios', routerLink: '/a', url: 'https://exemplo.com/b' }]);
      expect(anchorOf(root, 'Relatórios')?.getAttribute('href')).toBe('/a');
    });

    it('UI-043.S6 / M-02: a disabled item has no href anywhere and does not navigate', async () => {
      const command = jest.fn();
      const { fixture, root } = mount([{ label: 'Relatórios', routerLink: '/relatorios', disabled: true, command }]);
      expect(root.querySelector('[href]')).toBeNull();
      click(labelEl(root, 'Relatórios'));
      await fixture.whenStable();
      expect(router.url).toBe('/');
      expect(command).not.toHaveBeenCalled();
    });

    it.each(['javascript:alert(1)', '//evil.com', 'https://evil.com'])('M-01: routerLink %s renders an href that is a single-slash app path', (hostile) => {
      const { root } = mount([{ label: 'Hostile', routerLink: hostile }]);
      const href = anchorOf(root, 'Hostile')?.getAttribute('href') ?? '';
      expect(href).toMatch(/^\/(?!\/)/);
      expect(href).not.toMatch(/^[a-z][a-z0-9+.-]*:/i);
    });
  });

  describe.each(CASES)('active item — $name', ({ mount }) => {
    const ITEMS: MenuItem[] = [
      { label: 'Relatórios', routerLink: '/relatorios' },
      { label: 'Contas', routerLink: '/contas' },
    ];

    function isMarked(root: HTMLElement, label: string): boolean {
      const anchor = anchorOf(root, label)!;
      return anchor.getAttribute('aria-current') === 'page' && anchor.classList.contains('text-brand-600') && anchor.classList.contains('dark:text-brand-400');
    }

    function isUnmarked(root: HTMLElement, label: string): boolean {
      const anchor = anchorOf(root, label)!;
      return !anchor.hasAttribute('aria-current') && !anchor.classList.contains('text-brand-600');
    }

    it('UI-044.S1: the current route marks its item with aria-current="page" and the active style', async () => {
      await router.navigateByUrl('/relatorios');
      const { root } = mount(ITEMS);
      expect(isMarked(root, 'Relatórios')).toBe(true);
      expect(isUnmarked(root, 'Contas')).toBe(true);
    });

    it('UI-044.S2: a prefix match marks the item by default', async () => {
      await router.navigateByUrl('/relatorios/2026');
      const { root } = mount(ITEMS);
      expect(isMarked(root, 'Relatórios')).toBe(true);
    });

    it('UI-044.S3: routerLinkActiveOptions { exact: true } requires an exact match', async () => {
      await router.navigateByUrl('/relatorios/2026');
      const { root } = mount([{ label: 'Relatórios', routerLink: '/relatorios', routerLinkActiveOptions: { exact: true } }]);
      expect(isUnmarked(root, 'Relatórios')).toBe(true);
    });

    it('UI-044.S3: exact: true still marks the item on the exact URL', async () => {
      await router.navigateByUrl('/relatorios');
      const { root } = mount([{ label: 'Relatórios', routerLink: '/relatorios', routerLinkActiveOptions: { exact: true } }]);
      expect(isMarked(root, 'Relatórios')).toBe(true);
    });

    it('UI-044.S4: the mark follows navigation and the previous item loses aria-current', async () => {
      await router.navigateByUrl('/relatorios');
      const { fixture, root } = mount(ITEMS);
      expect(isMarked(root, 'Relatórios')).toBe(true);

      await router.navigateByUrl('/contas');
      fixture.detectChanges();

      expect(isMarked(root, 'Contas')).toBe(true);
      expect(isUnmarked(root, 'Relatórios')).toBe(true);
    });

    it('does not mark a sibling whose route only shares a text prefix (/contas vs /contas-extras)', async () => {
      await router.navigateByUrl('/contas-extras');
      const { root } = mount(ITEMS);
      expect(isUnmarked(root, 'Contas')).toBe(true);
    });
  });

  describe('activation paths that do not start from a click on an inline <a>', () => {
    function keydown(el: Element, key: string): void {
      el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    }

    it('med-menu popup: pointerdown then click on the <a> navigates and closes the menu', async () => {
      const command = jest.fn();
      const fixture = TestBed.createComponent(MenuComponent);
      fixture.componentRef.setInput('items', [{ label: 'Relatórios', routerLink: '/relatorios', command }]);
      fixture.detectChanges();
      const origin = document.createElement('button');
      document.body.appendChild(origin);
      fixture.componentInstance.open(origin);
      fixture.detectChanges();

      const anchor = document.querySelector<HTMLAnchorElement>('[role="menuitem"] a')!;
      anchor.dispatchEvent(new Event('pointerdown', { bubbles: true, cancelable: true }));
      expect(fixture.componentInstance.isOpen).toBe(true); // pointerdown must not close the menu before the click lands
      click(anchor);
      await fixture.whenStable();

      expect(router.url).toBe('/relatorios');
      expect(command).toHaveBeenCalledTimes(1);
      expect(fixture.componentInstance.isOpen).toBe(false);
      origin.remove();
    });

    it('med-menu: Enter on the active routerLink item navigates', async () => {
      const { fixture, root } = mountOf(MenuComponent, { popup: false, items: [{ label: 'Relatórios', routerLink: '/relatorios' }] });
      keydown(root.querySelector('[role="menu"]')!, 'Enter');
      await fixture.whenStable();
      expect(router.url).toBe('/relatorios');
    });

    it('med-tiered-menu: Enter on the active routerLink item navigates', async () => {
      const { fixture, root } = mountOf(TieredMenuComponent, { popup: false, items: [{ label: 'Relatórios', routerLink: '/relatorios' }] });
      keydown(root.querySelector('[role="menu"]')!, 'Enter');
      await fixture.whenStable();
      expect(router.url).toBe('/relatorios');
    });

    it('med-mega-menu: Enter on a routerLink item of an open panel navigates', async () => {
      const { fixture, root } = mountOf(MegaMenuComponent, {
        items: [{ label: 'Produtos', columns: [{ items: [{ label: 'Relatórios', routerLink: '/relatorios' }] }] }],
      });
      root.querySelector<HTMLElement>('nav ul button')!.click();
      fixture.detectChanges();
      keydown(document.querySelector('[role="menu"]')!, 'Enter');
      await fixture.whenStable();
      expect(router.url).toBe('/relatorios');
    });
  });

  describe('strategy', () => {
    it('M-01: navigate() uses the same URL tree as href, never the raw string', async () => {
      const strategy = TestBed.inject(MED_MENU_LINK_STRATEGY);
      const ended = firstValueFrom(router.events.pipe(filter((event) => event instanceof NavigationEnd)));
      strategy.navigate('//evil.com');
      await ended;
      expect(router.url).toBe(strategy.href('//evil.com'));
      expect(router.url).toBe('/evil.com');
    });

    it('href resolves from the root regardless of the current route', async () => {
      const strategy = TestBed.inject(MED_MENU_LINK_STRATEGY);
      await router.navigateByUrl('/a');
      expect(strategy.href('relatorios')).toBe('/relatorios');
    });
  });
});
