import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { IconFieldBasicDemo } from './demos/icon-field-basic.demo';

import iconFieldBasicCode from './demos/icon-field-basic.demo.html?raw';
import apiEntries from '../../../../content/api/icon-field.json';
import introContent from '../../../../content/docs/icon-field-intro.txt?raw';

const IMPORT_CODE = `import { IconComponent, IconFieldComponent, IconFieldIconDirective, InputTextDirective } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'IconField — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'IconField component docs: overlay a decorative icon inside the left or right padding of an input, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-icon-field',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, IconFieldBasicDemo],
  template: `
    <app-component-doc title="IconField" slug="icon-field">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-icon-field-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="iconFieldBasicCode" /></div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsIconField {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly iconFieldBasicCode = iconFieldBasicCode;
}
