import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { ProgressSpinnerBasicDemo } from './demos/progress-spinner-basic.demo';

import progressSpinnerBasicCode from './demos/progress-spinner-basic.demo.html?raw';
import apiEntries from '../../../../content/api/progress-spinner.json';
import introContent from '../../../../content/docs/progress-spinner-intro.txt?raw';

const IMPORT_CODE = `import { ProgressSpinnerComponent } from '@medra/ui';`;

export const routeMeta: RouteMeta = {
  title: 'ProgressSpinner — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'ProgressSpinner component docs: an indeterminate loading indicator, sizes and severities, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-progress-spinner',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, ProgressSpinnerBasicDemo],
  template: `
    <app-component-doc title="ProgressSpinner" slug="progress-spinner">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-progress-spinner-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="progressSpinnerBasicCode" /></div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsProgressSpinner {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly progressSpinnerBasicCode = progressSpinnerBasicCode;
}
