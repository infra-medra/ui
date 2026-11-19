import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { TabMenuBasicDemo } from './demos/tab-menu-basic.demo';
import { TabMenuVisibleDemo } from './demos/tab-menu-visible.demo';
import { TabMenuRouterLinkDemo } from './demos/tab-menu-router-link.demo';
import { TabMenuActiveDemo } from './demos/tab-menu-active.demo';

import tabMenuBasicCode from './demos/tab-menu-basic.demo.html?raw';
import tabMenuVisibleCode from './demos/tab-menu-visible.demo.html?raw';
import tabMenuRouterLinkCode from './demos/tab-menu-router-link.demo.html?raw';
import tabMenuActiveCode from './demos/tab-menu-active.demo.html?raw';
import apiEntries from '../../../../content/api/tab-menu.json';
import introContent from '../../../../content/docs/tab-menu-intro.txt?raw';
import tabMenuVisibleContent from '../../../../content/docs/tab-menu-visible.txt?raw';
import tabMenuRouterLinkContent from '../../../../content/docs/tab-menu-router-link.txt?raw';
import tabMenuActiveContent from '../../../../content/docs/tab-menu-active.txt?raw';

const IMPORT_CODE = `import { TabMenuComponent, type MenuItem } from '@medra/ui';`;

/** The examples listed in "On this page", in page order; each `id` is the anchor of its block. */
const EXAMPLES = [
  { id: 'example-visible', label: 'Hidden items' },
  { id: 'example-router-link', label: 'Router links' },
  { id: 'example-active', label: 'Active item' },
];

export const routeMeta: RouteMeta = {
  title: 'TabMenu — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'TabMenu component docs: a tab-styled navigation bar driven by MenuItem commands instead of content panels, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-tab-menu',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, TabMenuBasicDemo, TabMenuVisibleDemo, TabMenuRouterLinkDemo, TabMenuActiveDemo],
  template: `
    <app-component-doc title="TabMenu" slug="tab-menu" [examples]="examples">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-tab-menu-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="tabMenuBasicCode" /></div>

    <div id="example-visible" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="tabMenuVisibleContent" />
      <div class="mt-4">
        <app-tab-menu-visible-demo />
        <div class="mt-3"><app-code-block [code]="tabMenuVisibleCode" /></div>
      </div>
    </div>

    <div id="example-router-link" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="tabMenuRouterLinkContent" />
      <div class="mt-4">
        <app-tab-menu-router-link-demo />
        <div class="mt-3"><app-code-block [code]="tabMenuRouterLinkCode" /></div>
      </div>
    </div>

    <div id="example-active" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="tabMenuActiveContent" />
      <div class="mt-4">
        <app-tab-menu-active-demo />
        <div class="mt-3"><app-code-block [code]="tabMenuActiveCode" /></div>
      </div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsTabMenu {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly tabMenuBasicCode = tabMenuBasicCode;
  protected readonly tabMenuVisibleContent = tabMenuVisibleContent;
  protected readonly tabMenuVisibleCode = tabMenuVisibleCode;
  protected readonly tabMenuRouterLinkContent = tabMenuRouterLinkContent;
  protected readonly tabMenuRouterLinkCode = tabMenuRouterLinkCode;
  protected readonly tabMenuActiveContent = tabMenuActiveContent;
  protected readonly tabMenuActiveCode = tabMenuActiveCode;
  protected readonly examples = EXAMPLES;
}
