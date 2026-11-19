import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { InputTextBasicDemo } from './demos/input-text-basic.demo';
import { InputTextStatesDemo } from './demos/input-text-states.demo';

import inputTextBasicCode from './demos/input-text-basic.demo.html?raw';
import inputTextStatesCode from './demos/input-text-states.demo.html?raw';
import apiEntries from '../../../../content/api/input-text.json';
import introContent from '../../../../content/docs/input-text-intro.txt?raw';
import statesContent from '../../../../content/docs/input-text-states.txt?raw';

const IMPORT_CODE = `import { InputTextDirective } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'InputText — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'InputText component docs: sizes, invalid state, ControlValueAccessor forms integration, and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-input-text',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, InputTextBasicDemo, InputTextStatesDemo],
  template: `
    <app-component-doc title="InputText" slug="input-text">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-input-text-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="inputTextBasicCode" /></div>

    <app-prose class="mt-10 block" [content]="statesContent" />
    <div class="mt-4"><app-input-text-states-demo /></div>
    <div class="mt-3"><app-code-block [code]="inputTextStatesCode" /></div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsInputText {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly statesContent = statesContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly inputTextBasicCode = inputTextBasicCode;
  protected readonly inputTextStatesCode = inputTextStatesCode;
}
