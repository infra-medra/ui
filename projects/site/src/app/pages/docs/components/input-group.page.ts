import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { InputGroupBasicDemo } from './demos/input-group-basic.demo';

import inputGroupBasicCode from './demos/input-group-basic.demo.html?raw';
import apiEntries from '../../../../content/api/input-group.json';
import introContent from '../../../../content/docs/input-group-intro.txt?raw';

const IMPORT_CODE = `import { InputGroupAddonDirective, InputGroupComponent, InputTextDirective } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'InputGroup — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'InputGroup component docs: join an input with prefix and suffix addons into one continuous field, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-input-group',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, InputGroupBasicDemo],
  template: `
    <app-component-doc title="InputGroup" slug="input-group">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-input-group-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="inputGroupBasicCode" /></div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsInputGroup {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly inputGroupBasicCode = inputGroupBasicCode;
}
