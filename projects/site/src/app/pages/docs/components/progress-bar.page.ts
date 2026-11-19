import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { ProgressBarBasicDemo } from './demos/progress-bar-basic.demo';
import { ProgressBarSizesDemo } from './demos/progress-bar-sizes.demo';
import { ProgressBarContentDemo } from './demos/progress-bar-content.demo';
import { ProgressBarUnitDemo } from './demos/progress-bar-unit.demo';

import progressBarBasicCode from './demos/progress-bar-basic.demo.html?raw';
import progressBarSizesCode from './demos/progress-bar-sizes.demo.html?raw';
import progressBarContentCode from './demos/progress-bar-content.demo.html?raw';
import progressBarUnitCode from './demos/progress-bar-unit.demo.html?raw';
import apiEntries from '../../../../content/api/progress-bar.json';
import introContent from '../../../../content/docs/progress-bar-intro.txt?raw';
import sizesContent from '../../../../content/docs/progress-bar-sizes.txt?raw';
import contentDemoContent from '../../../../content/docs/progress-bar-content.txt?raw';
import unitContent from '../../../../content/docs/progress-bar-unit.txt?raw';

const IMPORT_CODE = `import { ProgressBarComponent } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'ProgressBar — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'ProgressBar component docs: determinate and indeterminate modes, sizes, and severities, with live examples and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-progress-bar',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, ProgressBarBasicDemo, ProgressBarSizesDemo, ProgressBarContentDemo, ProgressBarUnitDemo],
  template: `
    <app-component-doc title="ProgressBar" slug="progress-bar">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-progress-bar-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="progressBarBasicCode" /></div>

    <app-prose class="mt-10 block" [content]="sizesContent" />
    <div class="mt-4"><app-progress-bar-sizes-demo /></div>
    <div class="mt-3"><app-code-block [code]="progressBarSizesCode" /></div>

    <app-prose class="mt-10 block" [content]="contentDemoContent" />
    <div class="mt-4"><app-progress-bar-content-demo /></div>
    <div class="mt-3"><app-code-block [code]="progressBarContentCode" /></div>

    <app-prose class="mt-10 block" [content]="unitContent" />
    <div class="mt-4"><app-progress-bar-unit-demo /></div>
    <div class="mt-3"><app-code-block [code]="progressBarUnitCode" /></div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsProgressBar {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly sizesContent = sizesContent;
  protected readonly contentDemoContent = contentDemoContent;
  protected readonly unitContent = unitContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly progressBarBasicCode = progressBarBasicCode;
  protected readonly progressBarSizesCode = progressBarSizesCode;
  protected readonly progressBarContentCode = progressBarContentCode;
  protected readonly progressBarUnitCode = progressBarUnitCode;
}
