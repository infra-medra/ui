import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { ScrollPanelBasicDemo } from './demos/scroll-panel-basic.demo';
import { ScrollPanelScrollToDemo } from './demos/scroll-panel-scroll-to.demo';

import scrollPanelBasicCode from './demos/scroll-panel-basic.demo.html?raw';
import scrollPanelScrollToCode from './demos/scroll-panel-scroll-to.demo.html?raw';
import apiEntries from '../../../../content/api/scroll-panel.json';
import introContent from '../../../../content/docs/scroll-panel-intro.txt?raw';
import scrollToContent from '../../../../content/docs/scroll-panel-scroll-to.txt?raw';

const IMPORT_CODE = `import { ScrollPanelComponent } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'ScrollPanel — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'ScrollPanel component docs: a themed scrollable container with native scrolling, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-scroll-panel',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, ScrollPanelBasicDemo, ScrollPanelScrollToDemo],
  template: `
    <app-component-doc title="ScrollPanel" slug="scroll-panel">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-scroll-panel-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="scrollPanelBasicCode" /></div>

    <app-prose class="mt-10 block" [content]="scrollToContent" />
    <div class="mt-4"><app-scroll-panel-scroll-to-demo /></div>
    <div class="mt-3"><app-code-block [code]="scrollPanelScrollToCode" /></div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsScrollPanel {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly scrollToContent = scrollToContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly scrollPanelBasicCode = scrollPanelBasicCode;
  protected readonly scrollPanelScrollToCode = scrollPanelScrollToCode;
}
