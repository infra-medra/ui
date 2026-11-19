import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { ToggleButtonBasicDemo } from './demos/toggle-button-basic.demo';

import toggleButtonBasicCode from './demos/toggle-button-basic.demo.html?raw';
import apiEntries from '../../../../content/api/toggle-button.json';
import introContent from '../../../../content/docs/toggle-button-intro.txt?raw';

const IMPORT_CODE = `import { ToggleButtonComponent } from '@medra/ui';`;

export const routeMeta: RouteMeta = {
  title: 'ToggleButton — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'ToggleButton component docs: a labeled two-state pressed button with configurable on/off text and icons, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-toggle-button',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, ToggleButtonBasicDemo],
  template: `
    <app-component-doc title="ToggleButton" slug="toggle-button">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-toggle-button-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="toggleButtonBasicCode" /></div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsToggleButton {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly toggleButtonBasicCode = toggleButtonBasicCode;
}
