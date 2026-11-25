import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { TabsBasicDemo } from './demos/tabs-basic.demo';
import { TabsDynamicDemo } from './demos/tabs-dynamic.demo';
import { TabsControlledDemo } from './demos/tabs-controlled.demo';
import { TabsNavigatorsDemo } from './demos/tabs-navigators.demo';
import { TabsLazyDemo } from './demos/tabs-lazy.demo';
import { TabsDisabledDemo } from './demos/tabs-disabled.demo';
import { TabsTemplateDemo } from './demos/tabs-template.demo';

import tabsBasicCode from './demos/tabs-basic.demo.html?raw';
import tabsDynamicCode from './demos/tabs-dynamic.demo.html?raw';
import tabsDynamicTsCode from './demos/tabs-dynamic.demo.ts?raw';
import tabsControlledCode from './demos/tabs-controlled.demo.html?raw';
import tabsControlledTsCode from './demos/tabs-controlled.demo.ts?raw';
import tabsNavigatorsCode from './demos/tabs-navigators.demo.html?raw';
import tabsNavigatorsTsCode from './demos/tabs-navigators.demo.ts?raw';
import tabsLazyCode from './demos/tabs-lazy.demo.html?raw';
import tabsLazyTsCode from './demos/tabs-lazy.demo.ts?raw';
import tabsDisabledCode from './demos/tabs-disabled.demo.html?raw';
import tabsTemplateCode from './demos/tabs-template.demo.html?raw';
import apiEntries from '../../../../content/api/tabs.json';
import introContent from '../../../../content/docs/tabs-intro.txt?raw';
import basicContent from '../../../../content/docs/tabs-basic.txt?raw';
import dynamicContent from '../../../../content/docs/tabs-dynamic.txt?raw';
import controlledContent from '../../../../content/docs/tabs-controlled.txt?raw';
import navigatorsContent from '../../../../content/docs/tabs-navigators.txt?raw';
import lazyContent from '../../../../content/docs/tabs-lazy.txt?raw';
import disabledContent from '../../../../content/docs/tabs-disabled.txt?raw';
import templateContent from '../../../../content/docs/tabs-template.txt?raw';

const EXAMPLES = [
  { id: 'example-basic', label: 'Basic' },
  { id: 'example-dynamic', label: 'Dynamic' },
  { id: 'example-controlled', label: 'Controlled' },
  { id: 'example-scrollable', label: 'Scrollable' },
  { id: 'example-lazy', label: 'Lazy' },
  { id: 'example-disabled', label: 'Disabled' },
  { id: 'example-template', label: 'Template' },
] as const;

const IMPORT_CODE = `import { TabComponent, TabsComponent } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'Tabs — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Tabs component docs: dynamic and controlled tabs, scrollable navigators, lazy panels, disabled tabs, and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-tabs',
  imports: [
    ComponentDocComponent,
    ProseComponent,
    ApiTableComponent,
    CodeBlockComponent,
    TabsBasicDemo,
    TabsDynamicDemo,
    TabsControlledDemo,
    TabsNavigatorsDemo,
    TabsLazyDemo,
    TabsDisabledDemo,
    TabsTemplateDemo,
  ],
  template: `
    <app-component-doc title="Tabs" slug="tabs" [examples]="examples">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />

    <app-prose id="example-basic" class="mt-10 block scroll-mt-24" [content]="basicContent" />
    <div class="mt-4">
      <app-tabs-basic-demo />
      <div class="mt-3"><app-code-block [code]="tabsBasicCode" /></div>
    </div>

    <app-prose id="example-dynamic" class="mt-10 block scroll-mt-24" [content]="dynamicContent" />
    <div class="mt-4">
      <app-tabs-dynamic-demo />
      <div class="mt-3"><app-code-block [code]="tabsDynamicCode" /></div>
      <div class="mt-3"><app-code-block [code]="tabsDynamicTsCode" /></div>
    </div>

    <app-prose id="example-controlled" class="mt-10 block scroll-mt-24" [content]="controlledContent" />
    <div class="mt-4">
      <app-tabs-controlled-demo />
      <div class="mt-3"><app-code-block [code]="tabsControlledCode" /></div>
      <div class="mt-3"><app-code-block [code]="tabsControlledTsCode" /></div>
    </div>

    <app-prose id="example-scrollable" class="mt-10 block scroll-mt-24" [content]="navigatorsContent" />
    <div class="mt-4">
      <app-tabs-navigators-demo />
      <div class="mt-3"><app-code-block [code]="tabsNavigatorsCode" /></div>
      <div class="mt-3"><app-code-block [code]="tabsNavigatorsTsCode" /></div>
    </div>

    <app-prose id="example-lazy" class="mt-10 block scroll-mt-24" [content]="lazyContent" />
    <div class="mt-4">
      <app-tabs-lazy-demo />
      <div class="mt-3"><app-code-block [code]="tabsLazyCode" /></div>
      <div class="mt-3"><app-code-block [code]="tabsLazyTsCode" /></div>
    </div>

    <app-prose id="example-disabled" class="mt-10 block scroll-mt-24" [content]="disabledContent" />
    <div class="mt-4">
      <app-tabs-disabled-demo />
      <div class="mt-3"><app-code-block [code]="tabsDisabledCode" /></div>
    </div>

    <app-prose id="example-template" class="mt-10 block scroll-mt-24" [content]="templateContent" />
    <div class="mt-4">
      <app-tabs-template-demo />
      <div class="mt-3"><app-code-block [code]="tabsTemplateCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsTabs {
  protected readonly examples = EXAMPLES;
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly basicContent = basicContent;
  protected readonly dynamicContent = dynamicContent;
  protected readonly controlledContent = controlledContent;
  protected readonly navigatorsContent = navigatorsContent;
  protected readonly lazyContent = lazyContent;
  protected readonly disabledContent = disabledContent;
  protected readonly templateContent = templateContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly tabsBasicCode = tabsBasicCode;
  protected readonly tabsDynamicCode = tabsDynamicCode;
  protected readonly tabsDynamicTsCode = tabsDynamicTsCode;
  protected readonly tabsControlledCode = tabsControlledCode;
  protected readonly tabsControlledTsCode = tabsControlledTsCode;
  protected readonly tabsNavigatorsCode = tabsNavigatorsCode;
  protected readonly tabsNavigatorsTsCode = tabsNavigatorsTsCode;
  protected readonly tabsLazyCode = tabsLazyCode;
  protected readonly tabsLazyTsCode = tabsLazyTsCode;
  protected readonly tabsDisabledCode = tabsDisabledCode;
  protected readonly tabsTemplateCode = tabsTemplateCode;
}
