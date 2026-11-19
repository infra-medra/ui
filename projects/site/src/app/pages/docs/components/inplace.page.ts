import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { InplaceBasicDemo } from './demos/inplace-basic.demo';

import inplaceBasicCode from './demos/inplace-basic.demo.html?raw';
import apiEntries from '../../../../content/api/inplace.json';
import introContent from '../../../../content/docs/inplace-intro.txt?raw';

const IMPORT_CODE = `import { InplaceComponent, InplaceContentDirective, InplaceDisplayDirective, InputTextDirective } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'Inplace — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Inplace component docs: a click-to-edit toggle between a display view and a form control, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-inplace',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, InplaceBasicDemo],
  template: `
    <app-component-doc title="Inplace" slug="inplace">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4">
      <app-inplace-basic-demo />
      <div class="mt-3"><app-code-block [code]="inplaceBasicCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsInplace {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly inplaceBasicCode = inplaceBasicCode;
}
