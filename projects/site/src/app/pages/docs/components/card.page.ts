import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { CardBasicDemo } from './demos/card-basic.demo';
import { CardRichTitleDemo } from './demos/card-rich-title.demo';

import cardBasicCode from './demos/card-basic.demo.html?raw';
import cardRichTitleCode from './demos/card-rich-title.demo.html?raw';
import apiEntries from '../../../../content/api/card.json';
import introContent from '../../../../content/docs/card-intro.txt?raw';
import richTitleContent from '../../../../content/docs/card-rich-title.txt?raw';

const IMPORT_CODE = `import { CardComponent, CardFooterDirective, CardHeaderDirective } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'Card — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Card component docs: a container with title/subtitle inputs plus named header/footer content-projection slots, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-card',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, CardBasicDemo, CardRichTitleDemo],
  template: `
    <app-component-doc title="Card" slug="card">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-card-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="cardBasicCode" /></div>

    <app-prose class="mt-10 block" [content]="richTitleContent" />
    <div class="mt-4"><app-card-rich-title-demo /></div>
    <div class="mt-3"><app-code-block [code]="cardRichTitleCode" /></div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsCard {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly richTitleContent = richTitleContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly cardBasicCode = cardBasicCode;
  protected readonly cardRichTitleCode = cardRichTitleCode;
}
