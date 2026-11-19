import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { MenubarBasicDemo } from './demos/menubar-basic.demo';
import { MenubarVisibleDemo } from './demos/menubar-visible.demo';
import { MenubarRouterLinkDemo } from './demos/menubar-router-link.demo';
import { MenubarActiveDemo } from './demos/menubar-active.demo';

import menubarBasicCode from './demos/menubar-basic.demo.html?raw';
import menubarVisibleCode from './demos/menubar-visible.demo.html?raw';
import menubarRouterLinkCode from './demos/menubar-router-link.demo.html?raw';
import menubarActiveCode from './demos/menubar-active.demo.html?raw';
import apiEntries from '../../../../content/api/menubar.json';
import introContent from '../../../../content/docs/menubar-intro.txt?raw';
import menubarVisibleContent from '../../../../content/docs/menubar-visible.txt?raw';
import menubarRouterLinkContent from '../../../../content/docs/menubar-router-link.txt?raw';
import menubarActiveContent from '../../../../content/docs/menubar-active.txt?raw';

const IMPORT_CODE = `import { MenubarComponent, type MenubarItem } from '@medra.dev/ui';`;

/** The examples listed in "On this page", in page order; each `id` is the anchor of its block. */
const EXAMPLES = [
  { id: 'example-visible', label: 'Hidden items' },
  { id: 'example-router-link', label: 'Router links' },
  { id: 'example-active', label: 'Active item' },
];

export const routeMeta: RouteMeta = {
  title: 'Menubar — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Menubar component docs: a horizontal row of top-level commands with one-level-deep dropdowns, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-menubar',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, MenubarBasicDemo, MenubarVisibleDemo, MenubarRouterLinkDemo, MenubarActiveDemo],
  template: `
    <app-component-doc title="Menubar" slug="menubar" [examples]="examples">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4">
      <app-menubar-basic-demo />
      <div class="mt-3"><app-code-block [code]="menubarBasicCode" /></div>
    </div>

    <div id="example-visible" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="menubarVisibleContent" />
      <div class="mt-4">
        <app-menubar-visible-demo />
        <div class="mt-3"><app-code-block [code]="menubarVisibleCode" /></div>
      </div>
    </div>

    <div id="example-router-link" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="menubarRouterLinkContent" />
      <div class="mt-4">
        <app-menubar-router-link-demo />
        <div class="mt-3"><app-code-block [code]="menubarRouterLinkCode" /></div>
      </div>
    </div>

    <div id="example-active" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="menubarActiveContent" />
      <div class="mt-4">
        <app-menubar-active-demo />
        <div class="mt-3"><app-code-block [code]="menubarActiveCode" /></div>
      </div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsMenubar {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly menubarBasicCode = menubarBasicCode;
  protected readonly menubarVisibleContent = menubarVisibleContent;
  protected readonly menubarVisibleCode = menubarVisibleCode;
  protected readonly menubarRouterLinkContent = menubarRouterLinkContent;
  protected readonly menubarRouterLinkCode = menubarRouterLinkCode;
  protected readonly menubarActiveContent = menubarActiveContent;
  protected readonly menubarActiveCode = menubarActiveCode;
  protected readonly examples = EXAMPLES;
}
