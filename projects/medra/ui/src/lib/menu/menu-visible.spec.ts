import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { MegaMenuComponent } from '../mega-menu/mega-menu.component';
import { MegaMenuItem } from '../mega-menu/mega-menu.types';
import { MenubarComponent } from '../menubar/menubar.component';
import { MenubarItem } from '../menubar/menubar.types';
import { PanelMenuComponent } from '../panel-menu/panel-menu.component';
import { TabMenuComponent } from '../tab-menu/tab-menu.component';
import { TieredMenuComponent } from '../tiered-menu/tiered-menu.component';
import { TieredMenuItem } from '../tiered-menu/tiered-menu.types';
import { MenuComponent } from './menu.component';
import { MenuItem, MenuItemGroup } from './menu.types';

/**
 * UI-042 — `MenuItem.visible`: a `visible: false` item (and its children) is
 * omitted from the DOM and from keyboard navigation in all six menu
 * components; an absent `visible` counts as `true`.
 */

function keydown(el: Element, key: string): void {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

function texts(els: Iterable<Element>): string[] {
  return Array.from(els).map((el) => el.textContent?.trim() ?? '');
}

function overlayMenuItems(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[role="menuitem"]'));
}

function activeDescendantText(root: ParentNode): string | undefined {
  const menu = root.querySelector('[role="menu"]');
  const id = menu?.getAttribute('aria-activedescendant');
  return id ? document.getElementById(id)?.textContent?.trim() : undefined;
}

const HIDDEN_FLAT: MenuItem[] = [{ label: 'Início' }, { label: 'Relatórios', visible: false }, { label: 'Sair' }];
const SHOWN_FLAT: MenuItem[] = [{ label: 'Início' }, { label: 'Relatórios', visible: true }, { label: 'Sair' }];

describe('menu item `visible` (UI-042)', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [OverlayModule] });
  });

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  describe('med-menu', () => {
    function create(items: readonly MenuItem[] | readonly MenuItemGroup[]): ComponentFixture<MenuComponent> {
      const fixture = TestBed.createComponent(MenuComponent);
      fixture.componentRef.setInput('popup', false);
      fixture.componentRef.setInput('items', items);
      fixture.detectChanges();
      return fixture;
    }

    it('UI-042.S1: omits an item with visible: false', () => {
      const fixture = create(HIDDEN_FLAT);
      expect(texts(fixture.nativeElement.querySelectorAll('[role="menuitem"]'))).toEqual(['Início', 'Sair']);
    });

    it('UI-042.S2: ArrowDown skips the hidden item', () => {
      const fixture = create(HIDDEN_FLAT);
      expect(activeDescendantText(fixture.nativeElement)).toBe('Início');
      keydown(fixture.nativeElement.querySelector('[role="menu"]'), 'ArrowDown');
      fixture.detectChanges();
      expect(activeDescendantText(fixture.nativeElement)).toBe('Sair');
    });

    it('UI-042.S4: a new array with visible: true shows the item without recreating the component', () => {
      const fixture = create(HIDDEN_FLAT);
      const host = fixture.nativeElement;
      expect(texts(fixture.nativeElement.querySelectorAll('[role="menuitem"]'))).toEqual(['Início', 'Sair']);
      fixture.componentRef.setInput('items', SHOWN_FLAT);
      fixture.detectChanges();
      expect(fixture.nativeElement).toBe(host);
      expect(texts(fixture.nativeElement.querySelectorAll('[role="menuitem"]'))).toEqual(['Início', 'Relatórios', 'Sair']);
    });

    it('UI-042.S5: a group with no visible item disappears together with its label', () => {
      const fixture = create([
        { label: 'Conta', items: [{ label: 'Perfil' }, { label: 'Sair' }] },
        { label: 'Admin', items: [{ label: 'Usuários', visible: false }, { label: 'Logs', visible: false }] },
      ]);
      const text = fixture.nativeElement.textContent as string;
      expect(text).toContain('Conta');
      expect(text).toContain('Perfil');
      expect(text).not.toContain('Admin');
      expect(texts(fixture.nativeElement.querySelectorAll('[role="menuitem"]'))).toEqual(['Perfil', 'Sair']);
    });

    it('UI-042.S5: keyboard navigation crosses groups without landing on a hidden item', () => {
      const fixture = create([
        { label: 'Conta', items: [{ label: 'Perfil' }] },
        { label: 'Admin', items: [{ label: 'Usuários', visible: false }] },
        { label: 'Ajuda', items: [{ label: 'Sobre' }] },
      ]);
      keydown(fixture.nativeElement.querySelector('[role="menu"]'), 'ArrowDown');
      fixture.detectChanges();
      expect(activeDescendantText(fixture.nativeElement)).toBe('Sobre');
    });

    it('treats an absent `visible` as true', () => {
      const fixture = create([{ label: 'Início' }]);
      expect(texts(fixture.nativeElement.querySelectorAll('[role="menuitem"]'))).toEqual(['Início']);
    });
  });

  describe('med-menubar', () => {
    function create(items: readonly MenubarItem[]): ComponentFixture<MenubarComponent> {
      const fixture = TestBed.createComponent(MenubarComponent);
      fixture.componentRef.setInput('items', items);
      fixture.detectChanges();
      return fixture;
    }

    function topButtons(fixture: ComponentFixture<MenubarComponent>): HTMLElement[] {
      return Array.from(fixture.nativeElement.querySelectorAll('ul button, ul a'));
    }

    it('UI-042.S1: omits a top-level item with visible: false', () => {
      const fixture = create(HIDDEN_FLAT);
      expect(texts(topButtons(fixture))).toEqual(['Início', 'Sair']);
    });

    it('UI-042.S1: omits a hidden item from an open dropdown', () => {
      const fixture = create([{ label: 'Arquivo', items: [{ label: 'Abrir' }, { label: 'Excluir', visible: false }, { label: 'Fechar' }] }]);
      topButtons(fixture)[0].click();
      fixture.detectChanges();
      expect(texts(overlayMenuItems())).toEqual(['Abrir', 'Fechar']);
    });

    it('UI-042.S2: ArrowRight moves focus past the hidden top-level item', () => {
      const fixture = create(HIDDEN_FLAT);
      const buttons = topButtons(fixture);
      buttons[0].focus();
      keydown(buttons[0], 'ArrowRight');
      fixture.detectChanges();
      expect(document.activeElement?.textContent?.trim()).toBe('Sair');
    });

    it('UI-042.S2: ArrowDown inside the dropdown skips the hidden item', () => {
      const fixture = create([{ label: 'Arquivo', items: [{ label: 'Abrir' }, { label: 'Excluir', visible: false }, { label: 'Fechar' }] }]);
      topButtons(fixture)[0].click();
      fixture.detectChanges();
      keydown(document.querySelector('[role="menu"]')!, 'ArrowDown');
      fixture.detectChanges();
      expect(activeDescendantText(document)).toBe('Fechar');
    });

    it('UI-042.S3: a hidden parent hides its children', () => {
      const fixture = create([{ label: 'Admin', visible: false, items: [{ label: 'Usuários' }] }, { label: 'Início' }]);
      expect(texts(topButtons(fixture))).toEqual(['Início']);
      expect(fixture.nativeElement.textContent).not.toContain('Usuários');
    });

    it('UI-042.S4: a new array with visible: true shows the item', () => {
      const fixture = create(HIDDEN_FLAT);
      expect(texts(topButtons(fixture))).toEqual(['Início', 'Sair']);
      fixture.componentRef.setInput('items', SHOWN_FLAT);
      fixture.detectChanges();
      expect(texts(topButtons(fixture))).toEqual(['Início', 'Relatórios', 'Sair']);
    });
  });

  describe('med-mega-menu', () => {
    function create(items: readonly MegaMenuItem[]): ComponentFixture<MegaMenuComponent> {
      const fixture = TestBed.createComponent(MegaMenuComponent);
      fixture.componentRef.setInput('items', items);
      fixture.detectChanges();
      return fixture;
    }

    function topButtons(fixture: ComponentFixture<MegaMenuComponent>): HTMLElement[] {
      return Array.from(fixture.nativeElement.querySelectorAll('nav ul button, nav ul a'));
    }

    const WITH_COLUMNS: MegaMenuItem[] = [
      {
        label: 'Produtos',
        columns: [
          { header: 'Computadores', items: [{ label: 'Notebooks' }, { label: 'Servidores', visible: false }, { label: 'Desktops' }] },
          { header: 'Acessórios', items: [{ label: 'Teclados' }] },
        ],
      },
    ];

    it('UI-042.S1: omits a top-level item with visible: false', () => {
      const fixture = create(HIDDEN_FLAT);
      expect(texts(topButtons(fixture))).toEqual(['Início', 'Sair']);
    });

    it('UI-042.S1: omits a hidden item from a column', () => {
      const fixture = create(WITH_COLUMNS);
      topButtons(fixture)[0].click();
      fixture.detectChanges();
      expect(texts(overlayMenuItems())).toEqual(['Notebooks', 'Desktops', 'Teclados']);
    });

    it('UI-042.S2: ArrowDown inside a column skips the hidden item', () => {
      const fixture = create(WITH_COLUMNS);
      topButtons(fixture)[0].click();
      fixture.detectChanges();
      keydown(document.querySelector('[role="menu"]')!, 'ArrowDown');
      fixture.detectChanges();
      expect(activeDescendantText(document)).toBe('Desktops');
    });

    it('UI-042.S3: a hidden parent hides its columns', () => {
      const fixture = create([{ ...WITH_COLUMNS[0], visible: false }, { label: 'Início' }]);
      expect(texts(topButtons(fixture))).toEqual(['Início']);
      expect(fixture.nativeElement.textContent).not.toContain('Notebooks');
    });

    it('UI-042.S4: a new array with visible: true shows the item', () => {
      const fixture = create(HIDDEN_FLAT);
      expect(texts(topButtons(fixture))).toEqual(['Início', 'Sair']);
      fixture.componentRef.setInput('items', SHOWN_FLAT);
      fixture.detectChanges();
      expect(texts(topButtons(fixture))).toEqual(['Início', 'Relatórios', 'Sair']);
    });
  });

  describe('med-panel-menu', () => {
    function create(items: readonly TieredMenuItem[]): ComponentFixture<PanelMenuComponent> {
      const fixture = TestBed.createComponent(PanelMenuComponent);
      fixture.componentRef.setInput('items', items);
      fixture.detectChanges();
      return fixture;
    }

    function buttons(fixture: ComponentFixture<PanelMenuComponent>): HTMLElement[] {
      return Array.from(fixture.nativeElement.querySelectorAll('button, a'));
    }

    it('UI-042.S1: omits an item with visible: false', () => {
      const fixture = create(HIDDEN_FLAT);
      expect(texts(buttons(fixture))).toEqual(['Início', 'Sair']);
    });

    it('UI-042.S1: omits a hidden child from an expanded node', () => {
      const fixture = create([{ label: 'Arquivo', items: [{ label: 'Abrir' }, { label: 'Excluir', visible: false }] }]);
      buttons(fixture)[0].click();
      fixture.detectChanges();
      expect(texts(buttons(fixture))).toEqual(['Arquivo', 'Abrir']);
    });

    it('UI-042.S3: a hidden parent hides its children even when it is in expandedItems', () => {
      const parent: TieredMenuItem = { label: 'Admin', visible: false, items: [{ label: 'Usuários' }] };
      const fixture = create([parent, { label: 'Início' }]);
      fixture.componentInstance.expandedItems.set(new Set([parent]));
      fixture.detectChanges();
      expect(texts(buttons(fixture))).toEqual(['Início']);
      expect(fixture.nativeElement.textContent).not.toContain('Usuários');
    });

    it('UI-042.S4: a new array with visible: true shows the item', () => {
      const fixture = create(HIDDEN_FLAT);
      expect(texts(buttons(fixture))).toEqual(['Início', 'Sair']);
      fixture.componentRef.setInput('items', SHOWN_FLAT);
      fixture.detectChanges();
      expect(texts(buttons(fixture))).toEqual(['Início', 'Relatórios', 'Sair']);
    });

    it('keeps the identity of the items in expandedItems when some sibling is hidden', () => {
      const parent: TieredMenuItem = { label: 'Arquivo', items: [{ label: 'Abrir' }] };
      const fixture = create([{ label: 'Oculto', visible: false }, parent]);
      buttons(fixture)[0].click();
      fixture.detectChanges();
      expect(fixture.componentInstance.expandedItems().has(parent)).toBe(true);
      expect(texts(buttons(fixture))).toEqual(['Arquivo', 'Abrir']);
    });
  });

  describe('med-tiered-menu', () => {
    function create(items: readonly TieredMenuItem[]): ComponentFixture<TieredMenuComponent> {
      const fixture = TestBed.createComponent(TieredMenuComponent);
      fixture.componentRef.setInput('popup', false);
      fixture.componentRef.setInput('items', items);
      fixture.detectChanges();
      return fixture;
    }

    it('UI-042.S1: omits an item with visible: false', () => {
      const fixture = create(HIDDEN_FLAT);
      expect(texts(fixture.nativeElement.querySelectorAll('[role="menuitem"]'))).toEqual(['Início', 'Sair']);
    });

    it('UI-042.S2: ArrowDown skips the hidden item', () => {
      const fixture = create(HIDDEN_FLAT);
      keydown(fixture.nativeElement.querySelector('[role="menu"]'), 'ArrowDown');
      fixture.detectChanges();
      expect(activeDescendantText(fixture.nativeElement)).toBe('Sair');
    });

    it('UI-042.S2: typing a letter does not land on the hidden item', () => {
      const fixture = create([{ label: 'Início' }, { label: 'Relatórios', visible: false }, { label: 'Relógio' }]);
      keydown(fixture.nativeElement.querySelector('[role="menu"]'), 'r');
      fixture.detectChanges();
      expect(activeDescendantText(fixture.nativeElement)).toBe('Relógio');
    });

    it('UI-042.S1: omits a hidden item from a submenu', () => {
      const fixture = create([{ label: 'Arquivo', items: [{ label: 'Abrir' }, { label: 'Excluir', visible: false }] }]);
      keydown(fixture.nativeElement.querySelector('[role="menu"]'), 'ArrowRight');
      fixture.detectChanges();
      expect(texts(overlayMenuItems()).filter((t) => t !== 'Arquivo')).toEqual(['Abrir']);
    });

    it('UI-042.S3: a hidden parent hides its children', () => {
      const fixture = create([{ label: 'Admin', visible: false, items: [{ label: 'Usuários' }] }, { label: 'Início' }]);
      expect(texts(fixture.nativeElement.querySelectorAll('[role="menuitem"]'))).toEqual(['Início']);
      keydown(fixture.nativeElement.querySelector('[role="menu"]'), 'ArrowRight');
      fixture.detectChanges();
      expect(document.body.textContent).not.toContain('Usuários');
    });

    it('UI-042.S4: a new array with visible: true shows the item', () => {
      const fixture = create(HIDDEN_FLAT);
      expect(texts(fixture.nativeElement.querySelectorAll('[role="menuitem"]'))).toEqual(['Início', 'Sair']);
      fixture.componentRef.setInput('items', SHOWN_FLAT);
      fixture.detectChanges();
      expect(texts(fixture.nativeElement.querySelectorAll('[role="menuitem"]'))).toEqual(['Início', 'Relatórios', 'Sair']);
    });
  });

  describe('med-tab-menu', () => {
    function create(items: readonly MenuItem[], activeIndex = 0): ComponentFixture<TabMenuComponent> {
      const fixture = TestBed.createComponent(TabMenuComponent);
      fixture.componentRef.setInput('items', items);
      fixture.componentRef.setInput('activeIndex', activeIndex);
      fixture.detectChanges();
      return fixture;
    }

    function tabs(fixture: ComponentFixture<TabMenuComponent>): HTMLElement[] {
      return Array.from(fixture.nativeElement.querySelectorAll('[role="tab"]'));
    }

    it('UI-042.S1: omits a tab with visible: false', () => {
      const fixture = create(HIDDEN_FLAT);
      expect(texts(tabs(fixture))).toEqual(['Início', 'Sair']);
    });

    it('UI-042.S2: ArrowRight moves to the next visible tab', () => {
      const fixture = create(HIDDEN_FLAT);
      keydown(tabs(fixture)[0], 'ArrowRight');
      fixture.detectChanges();
      expect(document.activeElement?.textContent?.trim()).toBe('Sair');
      expect(tabs(fixture)[1].getAttribute('aria-selected')).toBe('true');
    });

    it('keeps `activeIndex` as an index into the original array (D-04)', () => {
      const fixture = create(HIDDEN_FLAT);
      keydown(tabs(fixture)[0], 'ArrowRight');
      fixture.detectChanges();
      expect(fixture.componentInstance.activeIndex()).toBe(2);
    });

    it('marks the tab selected by the original `activeIndex` when an earlier item is hidden', () => {
      const fixture = create(HIDDEN_FLAT, 2);
      expect(tabs(fixture).map((t) => t.getAttribute('aria-selected'))).toEqual(['false', 'true']);
    });

    it('UI-042.S4: a new array with visible: true shows the tab', () => {
      const fixture = create(HIDDEN_FLAT);
      expect(texts(tabs(fixture))).toEqual(['Início', 'Sair']);
      fixture.componentRef.setInput('items', SHOWN_FLAT);
      fixture.detectChanges();
      expect(texts(tabs(fixture))).toEqual(['Início', 'Relatórios', 'Sair']);
    });
  });
});
