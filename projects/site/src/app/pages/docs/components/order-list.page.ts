import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { OrderListBasicDemo } from './demos/order-list-basic.demo';

import orderListBasicCode from './demos/order-list-basic.demo.html?raw';
import apiEntries from '../../../../content/api/order-list.json';
import introContent from '../../../../content/docs/order-list-intro.txt?raw';

const IMPORT_CODE = `import { OrderListComponent } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'OrderList — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'OrderList component docs: a single reorderable list with move up/down/top/bottom controls and multi-select, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-order-list',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, OrderListBasicDemo],
  template: `
    <app-component-doc title="OrderList" slug="order-list">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-order-list-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="orderListBasicCode" /></div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsOrderList {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly orderListBasicCode = orderListBasicCode;
}
