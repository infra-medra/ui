import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { ToggleSwitchBasicDemo } from './demos/toggle-switch-basic.demo';

import toggleSwitchBasicCode from './demos/toggle-switch-basic.demo.html?raw';
import apiEntries from '../../../../content/api/toggle-switch.json';
import introContent from '../../../../content/docs/toggle-switch-intro.txt?raw';

const IMPORT_CODE = `import { ToggleSwitchComponent } from '@medra/ui';`;

export const routeMeta: RouteMeta = {
  title: 'ToggleSwitch — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'ToggleSwitch component docs: a binary iOS-style switch built on a visually-hidden native checkbox, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-toggle-switch',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, ToggleSwitchBasicDemo],
  template: `
    <app-component-doc title="ToggleSwitch" slug="toggle-switch">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-toggle-switch-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="toggleSwitchBasicCode" /></div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsToggleSwitch {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly toggleSwitchBasicCode = toggleSwitchBasicCode;
}
