import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { DividerBasicDemo } from './demos/divider-basic.demo';
import { DividerTypeDemo } from './demos/divider-type.demo';

import dividerBasicCode from './demos/divider-basic.demo.html?raw';
import dividerTypeCode from './demos/divider-type.demo.html?raw';
import apiEntries from '../../../../content/api/divider.json';
import introContent from '../../../../content/docs/divider-intro.txt?raw';
import typeContent from '../../../../content/docs/divider-type.txt?raw';

const IMPORT_CODE = `import { DividerComponent } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'Divider — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Divider component docs: a horizontal or vertical separator line, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-divider',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, DividerBasicDemo, DividerTypeDemo],
  template: `
    <app-component-doc title="Divider" slug="divider">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-divider-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="dividerBasicCode" /></div>

    <app-prose class="mt-10 block" [content]="typeContent" />
    <div class="mt-4"><app-divider-type-demo /></div>
    <div class="mt-3"><app-code-block [code]="dividerTypeCode" /></div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsDivider {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly typeContent = typeContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly dividerBasicCode = dividerBasicCode;
  protected readonly dividerTypeCode = dividerTypeCode;
}
