import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { TabsBasicDemo } from './demos/tabs-basic.demo';
import { TabsLazyDemo } from './demos/tabs-lazy.demo';
import { TabsNavigatorsDemo } from './demos/tabs-navigators.demo';

import tabsBasicCode from './demos/tabs-basic.demo.html?raw';
import tabsLazyCode from './demos/tabs-lazy.demo.html?raw';
import tabsNavigatorsCode from './demos/tabs-navigators.demo.html?raw';
import apiEntries from '../../../../content/api/tabs.json';
import introContent from '../../../../content/docs/tabs-intro.txt?raw';
import lazyContent from '../../../../content/docs/tabs-lazy.txt?raw';
import navigatorsContent from '../../../../content/docs/tabs-navigators.txt?raw';

const IMPORT_CODE = `import { TabComponent, TabsComponent } from '@medra/ui';`;

export const routeMeta: RouteMeta = {
  title: 'Tabs — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Tabs component docs: content-projected panels with automatic-activation keyboard navigation, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-tabs',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, TabsBasicDemo, TabsLazyDemo, TabsNavigatorsDemo],
  template: `
    <app-component-doc title="Tabs" slug="tabs">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-tabs-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="tabsBasicCode" /></div>

    <app-prose class="mt-10 block" [content]="lazyContent" />
    <div class="mt-4">
      <app-tabs-lazy-demo />
      <div class="mt-3"><app-code-block [code]="tabsLazyCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="navigatorsContent" />
    <div class="mt-4">
      <app-tabs-navigators-demo />
      <div class="mt-3"><app-code-block [code]="tabsNavigatorsCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsTabs {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly lazyContent = lazyContent;
  protected readonly navigatorsContent = navigatorsContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly tabsBasicCode = tabsBasicCode;
  protected readonly tabsLazyCode = tabsLazyCode;
  protected readonly tabsNavigatorsCode = tabsNavigatorsCode;
}
