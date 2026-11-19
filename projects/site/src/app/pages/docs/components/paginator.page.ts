import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { PaginatorBasicDemo } from './demos/paginator-basic.demo';
import { PaginatorRowsPerPageDemo } from './demos/paginator-rows-per-page.demo';
import { PaginatorFirstLastJumpDemo } from './demos/paginator-first-last-jump.demo';

import paginatorBasicCode from './demos/paginator-basic.demo.html?raw';
import paginatorRowsPerPageCode from './demos/paginator-rows-per-page.demo.html?raw';
import paginatorFirstLastJumpCode from './demos/paginator-first-last-jump.demo.html?raw';
import apiEntries from '../../../../content/api/paginator.json';
import introContent from '../../../../content/docs/paginator-intro.txt?raw';
import rowsPerPageContent from '../../../../content/docs/paginator-rows-per-page.txt?raw';
import firstLastJumpContent from '../../../../content/docs/paginator-first-last-jump.txt?raw';

const IMPORT_CODE = `import { PaginatorComponent } from '@medra/ui';`;

export const routeMeta: RouteMeta = {
  title: 'Paginator — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Paginator component docs: page navigation with roving-tabindex keyboard support, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-paginator',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, PaginatorBasicDemo, PaginatorRowsPerPageDemo, PaginatorFirstLastJumpDemo],
  template: `
    <app-component-doc title="Paginator" slug="paginator">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-paginator-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="paginatorBasicCode" /></div>

    <app-prose class="mt-10 block" [content]="rowsPerPageContent" />
    <div class="mt-4">
      <app-paginator-rows-per-page-demo />
      <div class="mt-3"><app-code-block [code]="paginatorRowsPerPageCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="firstLastJumpContent" />
    <div class="mt-4">
      <app-paginator-first-last-jump-demo />
      <div class="mt-3"><app-code-block [code]="paginatorFirstLastJumpCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsPaginator {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly rowsPerPageContent = rowsPerPageContent;
  protected readonly firstLastJumpContent = firstLastJumpContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly paginatorBasicCode = paginatorBasicCode;
  protected readonly paginatorRowsPerPageCode = paginatorRowsPerPageCode;
  protected readonly paginatorFirstLastJumpCode = paginatorFirstLastJumpCode;
}
