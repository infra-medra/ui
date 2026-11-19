import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { SplitterBasicDemo } from './demos/splitter-basic.demo';
import { SplitterCollapsibleDemo } from './demos/splitter-collapsible.demo';

import splitterBasicCode from './demos/splitter-basic.demo.html?raw';
import splitterCollapsibleCode from './demos/splitter-collapsible.demo.html?raw';
import apiEntries from '../../../../content/api/splitter.json';
import introContent from '../../../../content/docs/splitter-intro.txt?raw';
import collapsibleContent from '../../../../content/docs/splitter-collapsible.txt?raw';

const IMPORT_CODE = `import { SplitterComponent, SplitterGutterComponent, SplitterPanelComponent } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'Splitter — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Splitter component docs: resizable, content-projected panes, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-splitter',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, SplitterBasicDemo, SplitterCollapsibleDemo],
  template: `
    <app-component-doc title="Splitter" slug="splitter">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-splitter-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="splitterBasicCode" /></div>

    <app-prose class="mt-10 block" [content]="collapsibleContent" />
    <div class="mt-4"><app-splitter-collapsible-demo /></div>
    <div class="mt-3"><app-code-block [code]="splitterCollapsibleCode" /></div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsSplitter {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly collapsibleContent = collapsibleContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly splitterBasicCode = splitterBasicCode;
  protected readonly splitterCollapsibleCode = splitterCollapsibleCode;
}
