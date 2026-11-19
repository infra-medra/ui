import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { VirtualScrollerBasicDemo } from './demos/virtual-scroller-basic.demo';
import { VirtualScrollerLazyLoadDemo } from './demos/virtual-scroller-lazy-load.demo';
import { VirtualScrollerScrollToIndexDemo } from './demos/virtual-scroller-scroll-to-index.demo';

import virtualScrollerBasicCode from './demos/virtual-scroller-basic.demo.html?raw';
import virtualScrollerLazyLoadCode from './demos/virtual-scroller-lazy-load.demo.html?raw';
import virtualScrollerScrollToIndexCode from './demos/virtual-scroller-scroll-to-index.demo.html?raw';
import apiEntries from '../../../../content/api/virtual-scroller.json';
import introContent from '../../../../content/docs/virtual-scroller-intro.txt?raw';
import lazyLoadContent from '../../../../content/docs/virtual-scroller-lazy-load.txt?raw';
import scrollToIndexContent from '../../../../content/docs/virtual-scroller-scroll-to-index.txt?raw';

const IMPORT_CODE = `import { VirtualScrollerComponent } from '@medra/ui';`;

export const routeMeta: RouteMeta = {
  title: 'VirtualScroller — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'VirtualScroller component docs: a themed wrapper around Angular CDK fixed-size virtual scrolling for rendering large lists efficiently, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-virtual-scroller',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, VirtualScrollerBasicDemo, VirtualScrollerLazyLoadDemo, VirtualScrollerScrollToIndexDemo],
  template: `
    <app-component-doc title="VirtualScroller" slug="virtual-scroller">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4">
      <app-virtual-scroller-basic-demo />
      <div class="mt-3"><app-code-block [code]="virtualScrollerBasicCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="lazyLoadContent" />
    <div class="mt-4">
      <app-virtual-scroller-lazy-load-demo />
      <div class="mt-3"><app-code-block [code]="virtualScrollerLazyLoadCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="scrollToIndexContent" />
    <div class="mt-4">
      <app-virtual-scroller-scroll-to-index-demo />
      <div class="mt-3"><app-code-block [code]="virtualScrollerScrollToIndexCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsVirtualScroller {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly lazyLoadContent = lazyLoadContent;
  protected readonly scrollToIndexContent = scrollToIndexContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly virtualScrollerBasicCode = virtualScrollerBasicCode;
  protected readonly virtualScrollerLazyLoadCode = virtualScrollerLazyLoadCode;
  protected readonly virtualScrollerScrollToIndexCode = virtualScrollerScrollToIndexCode;
}
