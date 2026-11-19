import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { DialogBasicDemo } from './demos/dialog-basic.demo';
import { DialogWindowControlsDemo } from './demos/dialog-window-controls.demo';
import { DialogBehaviorDemo } from './demos/dialog-behavior.demo';

import dialogBasicCode from './demos/dialog-basic.demo.html?raw';
import dialogWindowControlsCode from './demos/dialog-window-controls.demo.html?raw';
import dialogBehaviorCode from './demos/dialog-behavior.demo.html?raw';
import apiEntries from '../../../../content/api/dialog.json';
import introContent from '../../../../content/docs/dialog-intro.txt?raw';
import windowControlsContent from '../../../../content/docs/dialog-window-controls.txt?raw';
import behaviorContent from '../../../../content/docs/dialog-behavior.txt?raw';

const IMPORT_CODE = `import { ButtonDirective, DialogService } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'Dialog — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Dialog service docs: opening a component imperatively, DialogRef/DIALOG_DATA, and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-dialog',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, DialogBasicDemo, DialogWindowControlsDemo, DialogBehaviorDemo],
  template: `
    <app-component-doc title="Dialog" slug="dialog">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4">
      <app-dialog-basic-demo />
      <div class="mt-3"><app-code-block [code]="dialogBasicCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="windowControlsContent" />
    <div class="mt-4">
      <app-dialog-window-controls-demo />
      <div class="mt-3"><app-code-block [code]="dialogWindowControlsCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="behaviorContent" />
    <div class="mt-4">
      <app-dialog-behavior-demo />
      <div class="mt-3"><app-code-block [code]="dialogBehaviorCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsDialog {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly windowControlsContent = windowControlsContent;
  protected readonly behaviorContent = behaviorContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly dialogBasicCode = dialogBasicCode;
  protected readonly dialogWindowControlsCode = dialogWindowControlsCode;
  protected readonly dialogBehaviorCode = dialogBehaviorCode;
}
