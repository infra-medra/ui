import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { DockBasicDemo } from './demos/dock-basic.demo';
import { DockItemTemplateDemo } from './demos/dock-item-template.demo';

import dockBasicCode from './demos/dock-basic.demo.html?raw';
import dockItemTemplateCode from './demos/dock-item-template.demo.html?raw';
import apiEntries from '../../../../content/api/dock.json';
import introContent from '../../../../content/docs/dock-intro.txt?raw';
import itemTemplateContent from '../../../../content/docs/dock-item-template.txt?raw';

const IMPORT_CODE = `import { DockComponent, type MenuItem } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'Dock — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Dock component docs: a macOS-style row of icon launchers that magnify near the pointer, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-dock',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, DockBasicDemo, DockItemTemplateDemo],
  template: `
    <app-component-doc title="Dock" slug="dock">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-dock-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="dockBasicCode" /></div>

    <app-prose class="mt-10 block" [content]="itemTemplateContent" />
    <div class="mt-4"><app-dock-item-template-demo /></div>
    <div class="mt-3"><app-code-block [code]="dockItemTemplateCode" /></div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsDock {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly itemTemplateContent = itemTemplateContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly dockBasicCode = dockBasicCode;
  protected readonly dockItemTemplateCode = dockItemTemplateCode;
}
