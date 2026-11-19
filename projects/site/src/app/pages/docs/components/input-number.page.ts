import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { InputNumberBasicDemo } from './demos/input-number-basic.demo';
import { InputNumberVerticalClearDemo } from './demos/input-number-vertical-clear.demo';

import inputNumberBasicCode from './demos/input-number-basic.demo.html?raw';
import inputNumberVerticalClearCode from './demos/input-number-vertical-clear.demo.html?raw';
import apiEntries from '../../../../content/api/input-number.json';
import introContent from '../../../../content/docs/input-number-intro.txt?raw';
import verticalClearContent from '../../../../content/docs/input-number-vertical-clear.txt?raw';

const IMPORT_CODE = `import { InputNumberComponent } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'InputNumber — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'InputNumber component docs: a keyboard-driven spinbutton input with Intl.NumberFormat-backed locale, currency, and grouping support, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-input-number',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, InputNumberBasicDemo, InputNumberVerticalClearDemo],
  template: `
    <app-component-doc title="InputNumber" slug="input-number">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-input-number-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="inputNumberBasicCode" /></div>

    <app-prose class="mt-10 block" [content]="verticalClearContent" />
    <div class="mt-4"><app-input-number-vertical-clear-demo /></div>
    <div class="mt-3"><app-code-block [code]="inputNumberVerticalClearCode" /></div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsInputNumber {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly verticalClearContent = verticalClearContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly inputNumberBasicCode = inputNumberBasicCode;
  protected readonly inputNumberVerticalClearCode = inputNumberVerticalClearCode;
}
