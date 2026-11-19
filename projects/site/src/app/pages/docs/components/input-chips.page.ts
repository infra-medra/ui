import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { InputChipsBasicDemo } from './demos/input-chips-basic.demo';

import inputChipsBasicCode from './demos/input-chips-basic.demo.html?raw';
import apiEntries from '../../../../content/api/input-chips.json';
import introContent from '../../../../content/docs/input-chips-intro.txt?raw';

const IMPORT_CODE = `import { InputChipsComponent } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'InputChips — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'InputChips component docs: a text field that turns each Enter-committed entry into a chip, bound as a plain string[] value, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-input-chips',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, InputChipsBasicDemo],
  template: `
    <app-component-doc title="InputChips" slug="input-chips">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-input-chips-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="inputChipsBasicCode" /></div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsInputChips {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly inputChipsBasicCode = inputChipsBasicCode;
}
