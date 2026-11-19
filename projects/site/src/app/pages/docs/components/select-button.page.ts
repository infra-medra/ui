import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { SelectButtonBasicDemo } from './demos/select-button-basic.demo';
import { SelectButtonAllowEmptyDemo } from './demos/select-button-allow-empty.demo';

import selectButtonBasicCode from './demos/select-button-basic.demo.html?raw';
import selectButtonAllowEmptyCode from './demos/select-button-allow-empty.demo.html?raw';
import apiEntries from '../../../../content/api/select-button.json';
import introContent from '../../../../content/docs/select-button-intro.txt?raw';
import allowEmptyContent from '../../../../content/docs/select-button-allow-empty.txt?raw';

const IMPORT_CODE = `import { SelectButtonComponent, type SelectOption } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'SelectButton — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'SelectButton component docs: a segmented single- or multi-select control driven by data options, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-select-button',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, SelectButtonBasicDemo, SelectButtonAllowEmptyDemo],
  template: `
    <app-component-doc title="SelectButton" slug="select-button">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-select-button-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="selectButtonBasicCode" /></div>

    <app-prose class="mt-10 block" [content]="allowEmptyContent" />
    <div class="mt-4"><app-select-button-allow-empty-demo /></div>
    <div class="mt-3"><app-code-block [code]="selectButtonAllowEmptyCode" /></div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsSelectButton {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly allowEmptyContent = allowEmptyContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly selectButtonBasicCode = selectButtonBasicCode;
  protected readonly selectButtonAllowEmptyCode = selectButtonAllowEmptyCode;
}
