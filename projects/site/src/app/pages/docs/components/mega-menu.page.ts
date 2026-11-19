import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { MegaMenuBasicDemo } from './demos/mega-menu-basic.demo';
import { MegaMenuTemplatesDemo } from './demos/mega-menu-templates.demo';
import { MegaMenuVisibleDemo } from './demos/mega-menu-visible.demo';
import { MegaMenuRouterLinkDemo } from './demos/mega-menu-router-link.demo';
import { MegaMenuActiveDemo } from './demos/mega-menu-active.demo';

import megaMenuBasicCode from './demos/mega-menu-basic.demo.html?raw';
import megaMenuTemplatesCode from './demos/mega-menu-templates.demo.html?raw';
import megaMenuVisibleCode from './demos/mega-menu-visible.demo.html?raw';
import megaMenuRouterLinkCode from './demos/mega-menu-router-link.demo.html?raw';
import megaMenuActiveCode from './demos/mega-menu-active.demo.html?raw';
import apiEntries from '../../../../content/api/mega-menu.json';
import introContent from '../../../../content/docs/mega-menu-intro.txt?raw';
import templatesContent from '../../../../content/docs/mega-menu-templates.txt?raw';
import megaMenuVisibleContent from '../../../../content/docs/mega-menu-visible.txt?raw';
import megaMenuRouterLinkContent from '../../../../content/docs/mega-menu-router-link.txt?raw';
import megaMenuActiveContent from '../../../../content/docs/mega-menu-active.txt?raw';

const IMPORT_CODE = `import { MegaMenuComponent, type MegaMenuItem } from '@medra/ui';`;

/** The examples listed in "On this page", in page order; each `id` is the anchor of its block. */
const EXAMPLES = [
  { id: 'example-visible', label: 'Hidden items' },
  { id: 'example-router-link', label: 'Router links' },
  { id: 'example-active', label: 'Active item' },
];

export const routeMeta: RouteMeta = {
  title: 'MegaMenu — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'MegaMenu component docs: a horizontal menu bar whose panels lay out as side-by-side columns, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-mega-menu',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, MegaMenuBasicDemo, MegaMenuTemplatesDemo, MegaMenuVisibleDemo, MegaMenuRouterLinkDemo, MegaMenuActiveDemo],
  template: `
    <app-component-doc title="MegaMenu" slug="mega-menu" [examples]="examples">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4">
      <app-mega-menu-basic-demo />
      <div class="mt-3"><app-code-block [code]="megaMenuBasicCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="templatesContent" />
    <div class="mt-4">
      <app-mega-menu-templates-demo />
      <div class="mt-3"><app-code-block [code]="megaMenuTemplatesCode" /></div>
    </div>

    <div id="example-visible" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="megaMenuVisibleContent" />
      <div class="mt-4">
        <app-mega-menu-visible-demo />
        <div class="mt-3"><app-code-block [code]="megaMenuVisibleCode" /></div>
      </div>
    </div>

    <div id="example-router-link" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="megaMenuRouterLinkContent" />
      <div class="mt-4">
        <app-mega-menu-router-link-demo />
        <div class="mt-3"><app-code-block [code]="megaMenuRouterLinkCode" /></div>
      </div>
    </div>

    <div id="example-active" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="megaMenuActiveContent" />
      <div class="mt-4">
        <app-mega-menu-active-demo />
        <div class="mt-3"><app-code-block [code]="megaMenuActiveCode" /></div>
      </div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsMegaMenu {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly templatesContent = templatesContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly megaMenuBasicCode = megaMenuBasicCode;
  protected readonly megaMenuTemplatesCode = megaMenuTemplatesCode;
  protected readonly megaMenuVisibleContent = megaMenuVisibleContent;
  protected readonly megaMenuVisibleCode = megaMenuVisibleCode;
  protected readonly megaMenuRouterLinkContent = megaMenuRouterLinkContent;
  protected readonly megaMenuRouterLinkCode = megaMenuRouterLinkCode;
  protected readonly megaMenuActiveContent = megaMenuActiveContent;
  protected readonly megaMenuActiveCode = megaMenuActiveCode;
  protected readonly examples = EXAMPLES;
}
