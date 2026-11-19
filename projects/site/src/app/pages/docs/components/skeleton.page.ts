import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { SkeletonBasicDemo } from './demos/skeleton-basic.demo';

import skeletonBasicCode from './demos/skeleton-basic.demo.html?raw';
import apiEntries from '../../../../content/api/skeleton.json';
import introContent from '../../../../content/docs/skeleton-intro.txt?raw';

const IMPORT_CODE = `import { SkeletonComponent } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'Skeleton — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Skeleton component docs: a rectangle or circle loading placeholder box with an optional shimmer animation, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-skeleton',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, SkeletonBasicDemo],
  template: `
    <app-component-doc title="Skeleton" slug="skeleton">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-skeleton-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="skeletonBasicCode" /></div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsSkeleton {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly skeletonBasicCode = skeletonBasicCode;
}
