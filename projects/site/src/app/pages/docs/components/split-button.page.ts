import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { SplitButtonBasicDemo } from './demos/split-button-basic.demo';
import { SplitButtonStatesDemo } from './demos/split-button-states.demo';

import splitButtonBasicCode from './demos/split-button-basic.demo.html?raw';
import splitButtonStatesCode from './demos/split-button-states.demo.html?raw';
import apiEntries from '../../../../content/api/split-button.json';
import introContent from '../../../../content/docs/split-button-intro.txt?raw';
import statesContent from '../../../../content/docs/split-button-states.txt?raw';

const IMPORT_CODE = `import { SplitButtonComponent, type MenuItem } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'SplitButton — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'SplitButton component docs: a primary action fused to a dropdown of related actions, with live examples and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-split-button',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, SplitButtonBasicDemo, SplitButtonStatesDemo],
  template: `
    <app-component-doc title="SplitButton" slug="split-button">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4">
      <app-split-button-basic-demo />
      <div class="mt-3"><app-code-block [code]="splitButtonBasicCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="statesContent" />
    <div class="mt-4">
      <app-split-button-states-demo />
      <div class="mt-3"><app-code-block [code]="splitButtonStatesCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsSplitButton {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly statesContent = statesContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly splitButtonBasicCode = splitButtonBasicCode;
  protected readonly splitButtonStatesCode = splitButtonStatesCode;
}
