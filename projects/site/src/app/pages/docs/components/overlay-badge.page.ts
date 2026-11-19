import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { OverlayBadgeBasicDemo } from './demos/overlay-badge-basic.demo';

import overlayBadgeBasicCode from './demos/overlay-badge-basic.demo.html?raw';
import apiEntries from '../../../../content/api/overlay-badge.json';
import introContent from '../../../../content/docs/overlay-badge-intro.txt?raw';

const IMPORT_CODE = `import { IconComponent, OverlayBadgeComponent } from '@medra/ui';`;

export const routeMeta: RouteMeta = {
  title: 'OverlayBadge — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'OverlayBadge component docs: overlays a Badge on a corner of any projected content, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-overlay-badge',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, OverlayBadgeBasicDemo],
  template: `
    <app-component-doc title="OverlayBadge" slug="overlay-badge">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-overlay-badge-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="overlayBadgeBasicCode" /></div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsOverlayBadge {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly overlayBadgeBasicCode = overlayBadgeBasicCode;
}
