import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { FieldsetBasicDemo } from './demos/fieldset-basic.demo';
import { FieldsetRichLegendDemo } from './demos/fieldset-rich-legend.demo';

import fieldsetBasicCode from './demos/fieldset-basic.demo.html?raw';
import fieldsetRichLegendCode from './demos/fieldset-rich-legend.demo.html?raw';
import apiEntries from '../../../../content/api/fieldset.json';
import introContent from '../../../../content/docs/fieldset-intro.txt?raw';
import richLegendContent from '../../../../content/docs/fieldset-rich-legend.txt?raw';

const IMPORT_CODE = `import { ButtonDirective, FieldsetComponent, InputTextDirective } from '@medra/ui';`;

export const routeMeta: RouteMeta = {
  title: 'Fieldset — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Fieldset component docs: a native fieldset/legend for grouping form controls, with live examples and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-fieldset',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, FieldsetBasicDemo, FieldsetRichLegendDemo],
  template: `
    <app-component-doc title="Fieldset" slug="fieldset">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4">
      <app-fieldset-basic-demo />
      <div class="mt-3"><app-code-block [code]="fieldsetBasicCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="richLegendContent" />
    <div class="mt-4">
      <app-fieldset-rich-legend-demo />
      <div class="mt-3"><app-code-block [code]="fieldsetRichLegendCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsFieldset {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly richLegendContent = richLegendContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly fieldsetBasicCode = fieldsetBasicCode;
  protected readonly fieldsetRichLegendCode = fieldsetRichLegendCode;
}
