import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { CheckboxBasicDemo } from './demos/checkbox-basic.demo';
import { CheckboxStatesDemo } from './demos/checkbox-states.demo';
import { CheckboxGroupDemo } from './demos/checkbox-group.demo';

import checkboxBasicCode from './demos/checkbox-basic.demo.html?raw';
import checkboxStatesCode from './demos/checkbox-states.demo.html?raw';
import checkboxGroupCode from './demos/checkbox-group.demo.html?raw';
import apiEntries from '../../../../content/api/checkbox.json';
import introContent from '../../../../content/docs/checkbox-intro.txt?raw';
import statesContent from '../../../../content/docs/checkbox-states.txt?raw';
import groupContent from '../../../../content/docs/checkbox-group.txt?raw';

const IMPORT_CODE = `import { CheckboxComponent } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'Checkbox — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Checkbox component docs: sizes, indeterminate and invalid states, ControlValueAccessor forms integration, and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-checkbox',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, CheckboxBasicDemo, CheckboxStatesDemo, CheckboxGroupDemo],
  template: `
    <app-component-doc title="Checkbox" slug="checkbox">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-checkbox-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="checkboxBasicCode" /></div>

    <app-prose class="mt-10 block" [content]="statesContent" />
    <div class="mt-4">
      <app-checkbox-states-demo />
      <div class="mt-3"><app-code-block [code]="checkboxStatesCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="groupContent" />
    <div class="mt-4">
      <app-checkbox-group-demo />
      <div class="mt-3"><app-code-block [code]="checkboxGroupCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsCheckbox {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly statesContent = statesContent;
  protected readonly groupContent = groupContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly checkboxBasicCode = checkboxBasicCode;
  protected readonly checkboxStatesCode = checkboxStatesCode;
  protected readonly checkboxGroupCode = checkboxGroupCode;
}
