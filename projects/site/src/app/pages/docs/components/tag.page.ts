import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { TagBasicDemo } from './demos/tag-basic.demo';

import tagBasicCode from './demos/tag-basic.demo.html?raw';
import apiEntries from '../../../../content/api/tag.json';
import introContent from '../../../../content/docs/tag-intro.txt?raw';

const IMPORT_CODE = `import { IconComponent, TagComponent } from '@medra/ui';`;

export const routeMeta: RouteMeta = {
  title: 'Tag — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Tag component docs: a small solid status label reusing Button’s own severity colors, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-tag',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, TagBasicDemo],
  template: `
    <app-component-doc title="Tag" slug="tag">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-tag-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="tagBasicCode" /></div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsTag {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly tagBasicCode = tagBasicCode;
}
