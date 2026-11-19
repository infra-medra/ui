import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { DrawerBasicDemo } from './demos/drawer-basic.demo';
import { DrawerModalDemo } from './demos/drawer-modal.demo';
import { DrawerTemplatesDemo } from './demos/drawer-templates.demo';
import { DrawerBehaviorDemo } from './demos/drawer-behavior.demo';

import drawerBasicCode from './demos/drawer-basic.demo.html?raw';
import drawerModalCode from './demos/drawer-modal.demo.html?raw';
import drawerTemplatesCode from './demos/drawer-templates.demo.html?raw';
import drawerBehaviorCode from './demos/drawer-behavior.demo.html?raw';
import apiEntries from '../../../../content/api/drawer.json';
import introContent from '../../../../content/docs/drawer-intro.txt?raw';
import modalContent from '../../../../content/docs/drawer-modal.txt?raw';
import templatesContent from '../../../../content/docs/drawer-templates.txt?raw';
import behaviorContent from '../../../../content/docs/drawer-behavior.txt?raw';

const IMPORT_CODE = `import { ButtonDirective, DrawerComponent } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'Drawer — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Drawer component docs: an inline, edge-anchored panel with modal and non-modal modes, with live examples and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-drawer',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, DrawerBasicDemo, DrawerModalDemo, DrawerTemplatesDemo, DrawerBehaviorDemo],
  template: `
    <app-component-doc title="Drawer" slug="drawer">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4">
      <app-drawer-basic-demo />
      <div class="mt-3"><app-code-block [code]="drawerBasicCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="modalContent" />
    <div class="mt-4">
      <app-drawer-modal-demo />
      <div class="mt-3"><app-code-block [code]="drawerModalCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="templatesContent" />
    <div class="mt-4">
      <app-drawer-templates-demo />
      <div class="mt-3"><app-code-block [code]="drawerTemplatesCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="behaviorContent" />
    <div class="mt-4">
      <app-drawer-behavior-demo />
      <div class="mt-3"><app-code-block [code]="drawerBehaviorCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsDrawer {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly modalContent = modalContent;
  protected readonly templatesContent = templatesContent;
  protected readonly behaviorContent = behaviorContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly drawerBasicCode = drawerBasicCode;
  protected readonly drawerModalCode = drawerModalCode;
  protected readonly drawerTemplatesCode = drawerTemplatesCode;
  protected readonly drawerBehaviorCode = drawerBehaviorCode;
}
