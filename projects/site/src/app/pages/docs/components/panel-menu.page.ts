import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { PanelMenuBasicDemo } from './demos/panel-menu-basic.demo';
import { PanelMenuExpandCollapseDemo } from './demos/panel-menu-expand-collapse.demo';
import { PanelMenuVisibleDemo } from './demos/panel-menu-visible.demo';
import { PanelMenuRouterLinkDemo } from './demos/panel-menu-router-link.demo';
import { PanelMenuActiveDemo } from './demos/panel-menu-active.demo';

import panelMenuBasicCode from './demos/panel-menu-basic.demo.html?raw';
import panelMenuExpandCollapseCode from './demos/panel-menu-expand-collapse.demo.html?raw';
import panelMenuVisibleCode from './demos/panel-menu-visible.demo.html?raw';
import panelMenuRouterLinkCode from './demos/panel-menu-router-link.demo.html?raw';
import panelMenuActiveCode from './demos/panel-menu-active.demo.html?raw';
import apiEntries from '../../../../content/api/panel-menu.json';
import introContent from '../../../../content/docs/panel-menu-intro.txt?raw';
import expandCollapseContent from '../../../../content/docs/panel-menu-expand-collapse.txt?raw';
import panelMenuVisibleContent from '../../../../content/docs/panel-menu-visible.txt?raw';
import panelMenuRouterLinkContent from '../../../../content/docs/panel-menu-router-link.txt?raw';
import panelMenuActiveContent from '../../../../content/docs/panel-menu-active.txt?raw';

const IMPORT_CODE = `import { PanelMenuComponent, type MenuItem, type TieredMenuItem } from '@medra.dev/ui';`;

/** The examples listed in "On this page", in page order; each `id` is the anchor of its block. */
const EXAMPLES = [
  { id: 'example-visible', label: 'Hidden items' },
  { id: 'example-router-link', label: 'Router links' },
  { id: 'example-active', label: 'Active item' },
];

export const routeMeta: RouteMeta = {
  title: 'PanelMenu — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'PanelMenu component docs: an always-visible, inline expand/collapse navigation tree, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-panel-menu',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, PanelMenuBasicDemo, PanelMenuExpandCollapseDemo, PanelMenuVisibleDemo, PanelMenuRouterLinkDemo, PanelMenuActiveDemo],
  template: `
    <app-component-doc title="PanelMenu" slug="panel-menu" [examples]="examples">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-panel-menu-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="panelMenuBasicCode" /></div>

    <app-prose class="mt-10 block" [content]="expandCollapseContent" />
    <div class="mt-4">
      <app-panel-menu-expand-collapse-demo />
      <div class="mt-3"><app-code-block [code]="panelMenuExpandCollapseCode" /></div>
    </div>

    <div id="example-visible" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="panelMenuVisibleContent" />
      <div class="mt-4">
        <app-panel-menu-visible-demo />
        <div class="mt-3"><app-code-block [code]="panelMenuVisibleCode" /></div>
      </div>
    </div>

    <div id="example-router-link" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="panelMenuRouterLinkContent" />
      <div class="mt-4">
        <app-panel-menu-router-link-demo />
        <div class="mt-3"><app-code-block [code]="panelMenuRouterLinkCode" /></div>
      </div>
    </div>

    <div id="example-active" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="panelMenuActiveContent" />
      <div class="mt-4">
        <app-panel-menu-active-demo />
        <div class="mt-3"><app-code-block [code]="panelMenuActiveCode" /></div>
      </div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsPanelMenu {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly panelMenuBasicCode = panelMenuBasicCode;
  protected readonly expandCollapseContent = expandCollapseContent;
  protected readonly panelMenuExpandCollapseCode = panelMenuExpandCollapseCode;
  protected readonly panelMenuVisibleContent = panelMenuVisibleContent;
  protected readonly panelMenuVisibleCode = panelMenuVisibleCode;
  protected readonly panelMenuRouterLinkContent = panelMenuRouterLinkContent;
  protected readonly panelMenuRouterLinkCode = panelMenuRouterLinkCode;
  protected readonly panelMenuActiveContent = panelMenuActiveContent;
  protected readonly panelMenuActiveCode = panelMenuActiveCode;
  protected readonly examples = EXAMPLES;
}
