import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { BadgeBasicDemo } from './demos/badge-basic.demo';

import badgeBasicCode from './demos/badge-basic.demo.html?raw';
import apiEntries from '../../../../content/api/badge.json';
import introContent from '../../../../content/docs/badge-intro.txt?raw';

const IMPORT_CODE = `import { BadgeComponent } from '@medra/ui';`;

export const routeMeta: RouteMeta = {
  title: 'Badge — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Badge component docs: a standalone count/status pill with severity and dot variants, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-badge',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, BadgeBasicDemo],
  template: `
    <app-component-doc title="Badge" slug="badge">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-badge-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="badgeBasicCode" /></div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsBadge {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly badgeBasicCode = badgeBasicCode;
}
