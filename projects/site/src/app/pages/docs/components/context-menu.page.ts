import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { ContextMenuBasicDemo } from './demos/context-menu-basic.demo';
import { ContextMenuNestedDemo } from './demos/context-menu-nested.demo';
import { ContextMenuGlobalDemo } from './demos/context-menu-global.demo';

import contextMenuBasicCode from './demos/context-menu-basic.demo.html?raw';
import contextMenuNestedCode from './demos/context-menu-nested.demo.html?raw';
import contextMenuGlobalCode from './demos/context-menu-global.demo.html?raw';
import apiEntries from '../../../../content/api/context-menu.json';
import introContent from '../../../../content/docs/context-menu-intro.txt?raw';
import nestedContent from '../../../../content/docs/context-menu-nested.txt?raw';
import globalContent from '../../../../content/docs/context-menu-global.txt?raw';

const IMPORT_CODE = `import { ContextMenuDirective, type MenuItem } from '@medra/ui';`;

export const routeMeta: RouteMeta = {
  title: 'ContextMenu — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'ContextMenu component docs: an attribute directive that opens a menu at the cursor on right-click, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-context-menu',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, ContextMenuBasicDemo, ContextMenuNestedDemo, ContextMenuGlobalDemo],
  template: `
    <app-component-doc title="ContextMenu" slug="context-menu">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4">
      <app-context-menu-basic-demo />
      <div class="mt-3"><app-code-block [code]="contextMenuBasicCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="nestedContent" />
    <div class="mt-4">
      <app-context-menu-nested-demo />
      <div class="mt-3"><app-code-block [code]="contextMenuNestedCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="globalContent" />
    <div class="mt-4">
      <app-context-menu-global-demo />
      <div class="mt-3"><app-code-block [code]="contextMenuGlobalCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsContextMenu {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly nestedContent = nestedContent;
  protected readonly globalContent = globalContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly contextMenuBasicCode = contextMenuBasicCode;
  protected readonly contextMenuNestedCode = contextMenuNestedCode;
  protected readonly contextMenuGlobalCode = contextMenuGlobalCode;
}
