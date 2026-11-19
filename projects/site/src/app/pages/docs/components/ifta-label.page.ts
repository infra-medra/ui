import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { IftaLabelBasicDemo } from './demos/ifta-label-basic.demo';

import iftaLabelBasicCode from './demos/ifta-label-basic.demo.html?raw';
import apiEntries from '../../../../content/api/ifta-label.json';
import introContent from '../../../../content/docs/ifta-label-intro.txt?raw';

const IMPORT_CODE = `import { IftaLabelComponent, IftaLabelTextDirective, InputTextDirective } from '@medra/ui';`;

export const routeMeta: RouteMeta = {
  title: 'IftaLabel — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'IftaLabel component docs: a wrapper that keeps a small label pinned above the field at all times, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-ifta-label',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, IftaLabelBasicDemo],
  template: `
    <app-component-doc title="IftaLabel" slug="ifta-label">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-ifta-label-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="iftaLabelBasicCode" /></div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsIftaLabel {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly iftaLabelBasicCode = iftaLabelBasicCode;
}
