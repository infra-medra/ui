import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { RatingBasicDemo } from './demos/rating-basic.demo';
import { RatingAllowHalfDemo } from './demos/rating-allow-half.demo';

import ratingBasicCode from './demos/rating-basic.demo.html?raw';
import ratingAllowHalfCode from './demos/rating-allow-half.demo.html?raw';
import apiEntries from '../../../../content/api/rating.json';
import introContent from '../../../../content/docs/rating-intro.txt?raw';
import allowHalfContent from '../../../../content/docs/rating-allow-half.txt?raw';

const IMPORT_CODE = `import { RatingComponent } from '@medra/ui';`;

export const routeMeta: RouteMeta = {
  title: 'Rating — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Rating component docs: a keyboard-navigable radiogroup of stars with an optional clear affordance and a static readonly summary mode, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-rating',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, RatingBasicDemo, RatingAllowHalfDemo],
  template: `
    <app-component-doc title="Rating" slug="rating">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-rating-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="ratingBasicCode" /></div>

    <app-prose class="mt-10 block" [content]="allowHalfContent" />
    <div class="mt-4">
      <app-rating-allow-half-demo />
      <div class="mt-3"><app-code-block [code]="ratingAllowHalfCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsRating {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly ratingBasicCode = ratingBasicCode;
  protected readonly allowHalfContent = allowHalfContent;
  protected readonly ratingAllowHalfCode = ratingAllowHalfCode;
}
