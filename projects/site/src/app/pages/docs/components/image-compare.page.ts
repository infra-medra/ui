import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { ImageCompareBasicDemo } from './demos/image-compare-basic.demo';

import imageCompareBasicCode from './demos/image-compare-basic.demo.html?raw';
import apiEntries from '../../../../content/api/image-compare.json';
import introContent from '../../../../content/docs/image-compare-intro.txt?raw';

const IMPORT_CODE = `import { ImageCompareComponent } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'ImageCompare — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'ImageCompare component docs: a draggable before/after image slider driven by clip-path, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-image-compare',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, ImageCompareBasicDemo],
  template: `
    <app-component-doc title="ImageCompare" slug="image-compare">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-image-compare-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="imageCompareBasicCode" /></div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsImageCompare {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly imageCompareBasicCode = imageCompareBasicCode;
}
