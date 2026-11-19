import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MegaMenuComponent } from '../mega-menu/mega-menu.component';
import { MenubarComponent } from '../menubar/menubar.component';
import { PanelMenuComponent } from '../panel-menu/panel-menu.component';
import { TabMenuComponent } from '../tab-menu/tab-menu.component';
import { TieredMenuComponent } from '../tiered-menu/tiered-menu.component';
import { MenuComponent } from './menu.component';
import { MenuItem } from './menu.types';

/**
 * UI-043.S8 — an item with `routerLink` rendered without the Router
 * integration (`MED_MENU_LINK_STRATEGY` not provided) fails with an error
 * that says how to fix the setup. This spec deliberately provides no Router.
 */

const MESSAGE =
  "MenuItem.routerLink needs the Router integration: add provideMedraMenuRouterLinks() from '@medra/ui/router' to the app providers (after provideRouter).";

const WITH_LINK: MenuItem[] = [{ label: 'Reports', routerLink: '/reports' }];
const WITHOUT_LINK: MenuItem[] = [{ label: 'Home' }, { label: 'External', url: 'https://example.com' }];

interface Case {
  readonly name: string;
  readonly mount: (items: MenuItem[]) => ComponentFixture<unknown>;
}

const CASES: Case[] = [
  {
    name: 'med-menu',
    mount: (items) => {
      const fixture = TestBed.createComponent(MenuComponent);
      fixture.componentRef.setInput('popup', false);
      fixture.componentRef.setInput('items', items);
      return fixture;
    },
  },
  {
    name: 'med-menubar',
    mount: (items) => {
      const fixture = TestBed.createComponent(MenubarComponent);
      fixture.componentRef.setInput('items', items);
      return fixture;
    },
  },
  {
    name: 'med-mega-menu',
    mount: (items) => {
      const fixture = TestBed.createComponent(MegaMenuComponent);
      fixture.componentRef.setInput('items', items);
      return fixture;
    },
  },
  {
    name: 'med-panel-menu',
    mount: (items) => {
      const fixture = TestBed.createComponent(PanelMenuComponent);
      fixture.componentRef.setInput('items', items);
      return fixture;
    },
  },
  {
    name: 'med-tiered-menu',
    mount: (items) => {
      const fixture = TestBed.createComponent(TieredMenuComponent);
      fixture.componentRef.setInput('popup', false);
      fixture.componentRef.setInput('items', items);
      return fixture;
    },
  },
  {
    name: 'med-tab-menu',
    mount: (items) => {
      const fixture = TestBed.createComponent(TabMenuComponent);
      fixture.componentRef.setInput('items', items);
      return fixture;
    },
  },
];

describe('menu link strategy is required for routerLink (UI-043.S8)', () => {
  describe.each(CASES)('$name', ({ mount }) => {
    it('throws a clear error when an item has routerLink and no integration is registered', () => {
      const fixture = mount(WITH_LINK);
      expect(() => fixture.detectChanges()).toThrow(MESSAGE);
    });

    it('renders items without routerLink with no integration registered', () => {
      const fixture = mount(WITHOUT_LINK);
      expect(() => fixture.detectChanges()).not.toThrow();
    });
  });
});
