import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { TieredMenuBasicDemo } from './demos/tiered-menu-basic.demo';
import { TieredMenuInlineDemo } from './demos/tiered-menu-inline.demo';
import { TieredMenuVisibleDemo } from './demos/tiered-menu-visible.demo';
import { TieredMenuRouterLinkDemo } from './demos/tiered-menu-router-link.demo';
import { TieredMenuActiveDemo } from './demos/tiered-menu-active.demo';

import tieredMenuBasicCode from './demos/tiered-menu-basic.demo.html?raw';
import tieredMenuInlineCode from './demos/tiered-menu-inline.demo.html?raw';
import tieredMenuVisibleCode from './demos/tiered-menu-visible.demo.html?raw';
import tieredMenuRouterLinkCode from './demos/tiered-menu-router-link.demo.html?raw';
import tieredMenuActiveCode from './demos/tiered-menu-active.demo.html?raw';
import apiEntries from '../../../../content/api/tiered-menu.json';
import introContent from '../../../../content/docs/tiered-menu-intro.txt?raw';
import inlineContent from '../../../../content/docs/tiered-menu-inline.txt?raw';
import tieredMenuVisibleContent from '../../../../content/docs/tiered-menu-visible.txt?raw';
import tieredMenuRouterLinkContent from '../../../../content/docs/tiered-menu-router-link.txt?raw';
import tieredMenuActiveContent from '../../../../content/docs/tiered-menu-active.txt?raw';

const IMPORT_CODE = `import { ButtonDirective, TieredMenuComponent, type TieredMenuItem } from '@medra.dev/ui';`;

/** The examples listed in "On this page", in page order; each `id` is the anchor of its block. */
const EXAMPLES = [
  { id: 'example-visible', label: 'Hidden items' },
  { id: 'example-router-link', label: 'Router links' },
  { id: 'example-active', label: 'Active item' },
];

export const routeMeta: RouteMeta = {
  title: 'TieredMenu — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'TieredMenu component docs: a popup menu with arbitrarily deep cascading submenus, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-tiered-menu',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, TieredMenuBasicDemo, TieredMenuInlineDemo, TieredMenuVisibleDemo, TieredMenuRouterLinkDemo, TieredMenuActiveDemo],
  template: `
    <app-component-doc title="TieredMenu" slug="tiered-menu" [examples]="examples">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4">
      <app-tiered-menu-basic-demo />
      <div class="mt-3"><app-code-block [code]="tieredMenuBasicCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="inlineContent" />
    <div class="mt-4">
      <app-tiered-menu-inline-demo />
      <div class="mt-3"><app-code-block [code]="tieredMenuInlineCode" /></div>
    </div>

    <div id="example-visible" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="tieredMenuVisibleContent" />
      <div class="mt-4">
        <app-tiered-menu-visible-demo />
        <div class="mt-3"><app-code-block [code]="tieredMenuVisibleCode" /></div>
      </div>
    </div>

    <div id="example-router-link" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="tieredMenuRouterLinkContent" />
      <div class="mt-4">
        <app-tiered-menu-router-link-demo />
        <div class="mt-3"><app-code-block [code]="tieredMenuRouterLinkCode" /></div>
      </div>
    </div>

    <div id="example-active" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="tieredMenuActiveContent" />
      <div class="mt-4">
        <app-tiered-menu-active-demo />
        <div class="mt-3"><app-code-block [code]="tieredMenuActiveCode" /></div>
      </div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsTieredMenu {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly inlineContent = inlineContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly tieredMenuBasicCode = tieredMenuBasicCode;
  protected readonly tieredMenuInlineCode = tieredMenuInlineCode;
  protected readonly tieredMenuVisibleContent = tieredMenuVisibleContent;
  protected readonly tieredMenuVisibleCode = tieredMenuVisibleCode;
  protected readonly tieredMenuRouterLinkContent = tieredMenuRouterLinkContent;
  protected readonly tieredMenuRouterLinkCode = tieredMenuRouterLinkCode;
  protected readonly tieredMenuActiveContent = tieredMenuActiveContent;
  protected readonly tieredMenuActiveCode = tieredMenuActiveCode;
  protected readonly examples = EXAMPLES;
}
