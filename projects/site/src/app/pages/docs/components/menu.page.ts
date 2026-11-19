import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { MenuBasicDemo } from './demos/menu-basic.demo';
import { MenuItemLinkBadgeDemo } from './demos/menu-item-link-badge.demo';
import { MenuInlineGroupsDemo } from './demos/menu-inline-groups.demo';
import { MenuVisibleDemo } from './demos/menu-visible.demo';
import { MenuRouterLinkDemo } from './demos/menu-router-link.demo';
import { MenuActiveDemo } from './demos/menu-active.demo';

import menuBasicCode from './demos/menu-basic.demo.html?raw';
import menuItemLinkBadgeCode from './demos/menu-item-link-badge.demo.html?raw';
import menuInlineGroupsCode from './demos/menu-inline-groups.demo.html?raw';
import menuVisibleCode from './demos/menu-visible.demo.html?raw';
import menuRouterLinkCode from './demos/menu-router-link.demo.html?raw';
import menuActiveCode from './demos/menu-active.demo.html?raw';
import apiEntries from '../../../../content/api/menu.json';
import introContent from '../../../../content/docs/menu-intro.txt?raw';
import linkBadgeContent from '../../../../content/docs/menu-item-link-badge.txt?raw';
import inlineGroupsContent from '../../../../content/docs/menu-inline-groups.txt?raw';
import menuVisibleContent from '../../../../content/docs/menu-visible.txt?raw';
import menuRouterLinkContent from '../../../../content/docs/menu-router-link.txt?raw';
import menuActiveContent from '../../../../content/docs/menu-active.txt?raw';

const IMPORT_CODE = `import { ButtonDirective, MenuComponent, type MenuItem } from '@medra/ui';`;

/** The examples listed in "On this page", in page order; each `id` is the anchor of its block. */
const EXAMPLES = [
  { id: 'example-visible', label: 'Hidden items' },
  { id: 'example-router-link', label: 'Router links' },
  { id: 'example-active', label: 'Active item' },
];

export const routeMeta: RouteMeta = {
  title: 'Menu — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Menu component docs: a popup list of commands declared once and toggled imperatively from any trigger, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-menu',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, MenuBasicDemo, MenuItemLinkBadgeDemo, MenuInlineGroupsDemo, MenuVisibleDemo, MenuRouterLinkDemo, MenuActiveDemo],
  template: `
    <app-component-doc title="Menu" slug="menu" [examples]="examples">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4">
      <app-menu-basic-demo />
      <div class="mt-3"><app-code-block [code]="menuBasicCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="linkBadgeContent" />
    <div class="mt-4">
      <app-menu-item-link-badge-demo />
      <div class="mt-3"><app-code-block [code]="menuItemLinkBadgeCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="inlineGroupsContent" />
    <div class="mt-4">
      <app-menu-inline-groups-demo />
      <div class="mt-3"><app-code-block [code]="menuInlineGroupsCode" /></div>
    </div>

    <div id="example-visible" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="menuVisibleContent" />
      <div class="mt-4">
        <app-menu-visible-demo />
        <div class="mt-3"><app-code-block [code]="menuVisibleCode" /></div>
      </div>
    </div>

    <div id="example-router-link" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="menuRouterLinkContent" />
      <div class="mt-4">
        <app-menu-router-link-demo />
        <div class="mt-3"><app-code-block [code]="menuRouterLinkCode" /></div>
      </div>
    </div>

    <div id="example-active" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="menuActiveContent" />
      <div class="mt-4">
        <app-menu-active-demo />
        <div class="mt-3"><app-code-block [code]="menuActiveCode" /></div>
      </div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsMenu {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly linkBadgeContent = linkBadgeContent;
  protected readonly inlineGroupsContent = inlineGroupsContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly menuBasicCode = menuBasicCode;
  protected readonly menuItemLinkBadgeCode = menuItemLinkBadgeCode;
  protected readonly menuInlineGroupsCode = menuInlineGroupsCode;
  protected readonly menuVisibleContent = menuVisibleContent;
  protected readonly menuVisibleCode = menuVisibleCode;
  protected readonly menuRouterLinkContent = menuRouterLinkContent;
  protected readonly menuRouterLinkCode = menuRouterLinkCode;
  protected readonly menuActiveContent = menuActiveContent;
  protected readonly menuActiveCode = menuActiveCode;
  protected readonly examples = EXAMPLES;
}
