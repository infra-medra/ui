import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { PopoverBasicDemo } from './demos/popover-basic.demo';
import { PopoverCustomizedDemo } from './demos/popover-customized.demo';

import popoverBasicCode from './demos/popover-basic.demo.html?raw';
import popoverCustomizedCode from './demos/popover-customized.demo.html?raw';
import apiEntries from '../../../../content/api/popover.json';
import introContent from '../../../../content/docs/popover-intro.txt?raw';
import customizedContent from '../../../../content/docs/popover-customized.txt?raw';

const IMPORT_CODE = `import { ButtonDirective, InputTextDirective, PopoverComponent } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'Popover — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Popover component docs: a toggled, anchored panel for arbitrary content, with live examples and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-popover',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, PopoverBasicDemo, PopoverCustomizedDemo],
  template: `
    <app-component-doc title="Popover" slug="popover">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4">
      <app-popover-basic-demo />
      <div class="mt-3"><app-code-block [code]="popoverBasicCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="customizedContent" />
    <div class="mt-4">
      <app-popover-customized-demo />
      <div class="mt-3"><app-code-block [code]="popoverCustomizedCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsPopover {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly customizedContent = customizedContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly popoverBasicCode = popoverBasicCode;
  protected readonly popoverCustomizedCode = popoverCustomizedCode;
}
