import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { PickListBasicDemo } from './demos/pick-list-basic.demo';
import { PickListFilterDisabledDemo } from './demos/pick-list-filter-disabled.demo';

import pickListBasicCode from './demos/pick-list-basic.demo.html?raw';
import pickListFilterDisabledCode from './demos/pick-list-filter-disabled.demo.html?raw';
import apiEntries from '../../../../content/api/pick-list.json';
import introContent from '../../../../content/docs/pick-list-intro.txt?raw';
import filterDisabledContent from '../../../../content/docs/pick-list-filter-disabled.txt?raw';

const IMPORT_CODE = `import { PickListComponent } from '@medra/ui';`;

export const routeMeta: RouteMeta = {
  title: 'PickList — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'PickList component docs: two lists with button-driven transfer between them, per-list multi-select, and double-click for a single-item move, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-pick-list',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, PickListBasicDemo, PickListFilterDisabledDemo],
  template: `
    <app-component-doc title="PickList" slug="pick-list">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-pick-list-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="pickListBasicCode" /></div>

    <app-prose class="mt-10 block" [content]="filterDisabledContent" />
    <div class="mt-4"><app-pick-list-filter-disabled-demo /></div>
    <div class="mt-3"><app-code-block [code]="pickListFilterDisabledCode" /></div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsPickList {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly filterDisabledContent = filterDisabledContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly pickListBasicCode = pickListBasicCode;
  protected readonly pickListFilterDisabledCode = pickListFilterDisabledCode;
}
