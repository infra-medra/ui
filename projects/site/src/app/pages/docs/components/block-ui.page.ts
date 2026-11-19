import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { BlockUiBasicDemo } from './demos/block-ui-basic.demo';
import { BlockUiTargetDemo } from './demos/block-ui-target.demo';

import blockUiBasicCode from './demos/block-ui-basic.demo.html?raw';
import blockUiTargetCode from './demos/block-ui-target.demo.html?raw';
import apiEntries from '../../../../content/api/block-ui.json';
import introContent from '../../../../content/docs/block-ui-intro.txt?raw';
import targetContent from '../../../../content/docs/block-ui-target.txt?raw';

const IMPORT_CODE = `import { BlockUiComponent, ButtonDirective, InputTextDirective } from '@medra/ui';`;

export const routeMeta: RouteMeta = {
  title: 'BlockUI — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'BlockUI component docs: masking content with a spinner while blocked, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-block-ui',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, BlockUiBasicDemo, BlockUiTargetDemo],
  template: `
    <app-component-doc title="BlockUI" slug="block-ui">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-block-ui-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="blockUiBasicCode" /></div>

    <app-prose class="mt-10 block" [content]="targetContent" />
    <div class="mt-4"><app-block-ui-target-demo /></div>
    <div class="mt-3"><app-code-block [code]="blockUiTargetCode" /></div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsBlockUi {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly targetContent = targetContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly blockUiBasicCode = blockUiBasicCode;
  protected readonly blockUiTargetCode = blockUiTargetCode;
}
