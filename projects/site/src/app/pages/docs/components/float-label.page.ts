import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { FloatLabelBasicDemo } from './demos/float-label-basic.demo';
import { FloatLabelVariantsDemo } from './demos/float-label-variants.demo';

import floatLabelBasicCode from './demos/float-label-basic.demo.html?raw';
import floatLabelVariantsCode from './demos/float-label-variants.demo.html?raw';
import apiEntries from '../../../../content/api/float-label.json';
import introContent from '../../../../content/docs/float-label-intro.txt?raw';
import variantsContent from '../../../../content/docs/float-label-variants.txt?raw';

const IMPORT_CODE = `import { FloatLabelComponent, FloatLabelTextDirective, InputTextDirective } from '@medra/ui';`;

export const routeMeta: RouteMeta = {
  title: 'FloatLabel — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'FloatLabel component docs: a CSS-only wrapper that floats a label out of a field on focus or value, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-float-label',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, FloatLabelBasicDemo, FloatLabelVariantsDemo],
  template: `
    <app-component-doc title="FloatLabel" slug="float-label">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-float-label-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="floatLabelBasicCode" /></div>

    <app-prose class="mt-10 block" [content]="variantsContent" />
    <div class="mt-4"><app-float-label-variants-demo /></div>
    <div class="mt-3"><app-code-block [code]="floatLabelVariantsCode" /></div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsFloatLabel {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly variantsContent = variantsContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly floatLabelBasicCode = floatLabelBasicCode;
  protected readonly floatLabelVariantsCode = floatLabelVariantsCode;
}
