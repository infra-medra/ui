import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { RadioButtonBasicDemo } from './demos/radio-button-basic.demo';

import radioButtonBasicCode from './demos/radio-button-basic.demo.html?raw';
import apiEntries from '../../../../content/api/radio-button.json';
import introContent from '../../../../content/docs/radio-button-intro.txt?raw';

const IMPORT_CODE = `import { RadioButtonComponent } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'RadioButton — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'RadioButton component docs: a standalone radio input grouped by a shared name and bound value, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-radio-button',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, RadioButtonBasicDemo],
  template: `
    <app-component-doc title="RadioButton" slug="radio-button">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-radio-button-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="radioButtonBasicCode" /></div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsRadioButton {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly radioButtonBasicCode = radioButtonBasicCode;
}
