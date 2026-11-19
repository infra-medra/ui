import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { PanelBasicDemo } from './demos/panel-basic.demo';
import { PanelTogglerDemo } from './demos/panel-toggler.demo';

import panelBasicCode from './demos/panel-basic.demo.html?raw';
import panelTogglerCode from './demos/panel-toggler.demo.html?raw';
import apiEntries from '../../../../content/api/panel.json';
import introContent from '../../../../content/docs/panel-intro.txt?raw';
import togglerContent from '../../../../content/docs/panel-toggler.txt?raw';

const IMPORT_CODE = `import { PanelComponent } from '@medra/ui';`;

export const routeMeta: RouteMeta = {
  title: 'Panel — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Panel component docs: a titled, optionally collapsible container, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-panel',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, PanelBasicDemo, PanelTogglerDemo],
  template: `
    <app-component-doc title="Panel" slug="panel">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4">
      <app-panel-basic-demo />
      <div class="mt-3"><app-code-block [code]="panelBasicCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="togglerContent" />
    <div class="mt-4">
      <app-panel-toggler-demo />
      <div class="mt-3"><app-code-block [code]="panelTogglerCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsPanel {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly togglerContent = togglerContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly panelBasicCode = panelBasicCode;
  protected readonly panelTogglerCode = panelTogglerCode;
}
