import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { ChipBasicDemo } from './demos/chip-basic.demo';
import { ChipRemoveIconDemo } from './demos/chip-remove-icon.demo';
import { ChipBrokenImageDemo } from './demos/chip-broken-image.demo';

import chipBasicCode from './demos/chip-basic.demo.html?raw';
import chipRemoveIconCode from './demos/chip-remove-icon.demo.html?raw';
import chipBrokenImageCode from './demos/chip-broken-image.demo.html?raw';
import apiEntries from '../../../../content/api/chip.json';
import introContent from '../../../../content/docs/chip-intro.txt?raw';
import removeIconContent from '../../../../content/docs/chip-remove-icon.txt?raw';
import brokenImageContent from '../../../../content/docs/chip-broken-image.txt?raw';

const IMPORT_CODE = `import { ChipComponent } from '@medra/ui';`;

export const routeMeta: RouteMeta = {
  title: 'Chip — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Chip component docs: an entity pill with optional icon/image lead and a removable close button, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-chip',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, ChipBasicDemo, ChipRemoveIconDemo, ChipBrokenImageDemo],
  template: `
    <app-component-doc title="Chip" slug="chip">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-chip-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="chipBasicCode" /></div>

    <app-prose class="mt-10 block" [content]="removeIconContent" />
    <div class="mt-4"><app-chip-remove-icon-demo /></div>
    <div class="mt-3"><app-code-block [code]="chipRemoveIconCode" /></div>

    <app-prose class="mt-10 block" [content]="brokenImageContent" />
    <div class="mt-4">
      <app-chip-broken-image-demo />
      <div class="mt-3"><app-code-block [code]="chipBrokenImageCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsChip {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly removeIconContent = removeIconContent;
  protected readonly brokenImageContent = brokenImageContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly chipBasicCode = chipBasicCode;
  protected readonly chipRemoveIconCode = chipRemoveIconCode;
  protected readonly chipBrokenImageCode = chipBrokenImageCode;
}
