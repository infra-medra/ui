import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { ToolbarBasicDemo } from './demos/toolbar-basic.demo';

import toolbarBasicCode from './demos/toolbar-basic.demo.html?raw';
import apiEntries from '../../../../content/api/toolbar.json';
import introContent from '../../../../content/docs/toolbar-intro.txt?raw';

const IMPORT_CODE = `import { ButtonDirective, ToolbarCenterDirective, ToolbarComponent, ToolbarEndDirective, ToolbarStartDirective } from '@medra/ui';`;

export const routeMeta: RouteMeta = {
  title: 'Toolbar — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Toolbar component docs: a three-slot header/action bar, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-toolbar',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, ToolbarBasicDemo],
  template: `
    <app-component-doc title="Toolbar" slug="toolbar">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-toolbar-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="toolbarBasicCode" /></div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsToolbar {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly toolbarBasicCode = toolbarBasicCode;
}
