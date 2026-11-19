import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { ConfirmDialogBasicDemo } from './demos/confirm-dialog-basic.demo';
import { ConfirmDialogHeadlessDemo } from './demos/confirm-dialog-headless.demo';
import { ConfirmDialogMessageDemo } from './demos/confirm-dialog-message.demo';
import { ConfirmDialogDraggableDemo } from './demos/confirm-dialog-draggable.demo';

import confirmDialogBasicCode from './demos/confirm-dialog-basic.demo.html?raw';
import confirmDialogHeadlessCode from './demos/confirm-dialog-headless.demo.html?raw';
import confirmDialogMessageCode from './demos/confirm-dialog-message.demo.html?raw';
import confirmDialogDraggableCode from './demos/confirm-dialog-draggable.demo.html?raw';
import apiEntries from '../../../../content/api/confirm-dialog.json';
import introContent from '../../../../content/docs/confirm-dialog-intro.txt?raw';
import headlessContent from '../../../../content/docs/confirm-dialog-headless.txt?raw';
import messageContent from '../../../../content/docs/confirm-dialog-message.txt?raw';
import draggableContent from '../../../../content/docs/confirm-dialog-draggable.txt?raw';

const IMPORT_CODE = `import { ButtonDirective, ConfirmDialogService } from '@medra/ui';`;

export const routeMeta: RouteMeta = {
  title: 'ConfirmDialog — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'ConfirmDialog service docs: a built-in Accept/Reject dialog over DialogService, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-confirm-dialog',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, ConfirmDialogBasicDemo, ConfirmDialogHeadlessDemo, ConfirmDialogMessageDemo, ConfirmDialogDraggableDemo],
  template: `
    <app-component-doc title="ConfirmDialog" slug="confirm-dialog">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4">
      <app-confirm-dialog-basic-demo />
      <div class="mt-3"><app-code-block [code]="confirmDialogBasicCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="headlessContent" />
    <div class="mt-4">
      <app-confirm-dialog-headless-demo />
      <div class="mt-3"><app-code-block [code]="confirmDialogHeadlessCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="messageContent" />
    <div class="mt-4">
      <app-confirm-dialog-message-demo />
      <div class="mt-3"><app-code-block [code]="confirmDialogMessageCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="draggableContent" />
    <div class="mt-4">
      <app-confirm-dialog-draggable-demo />
      <div class="mt-3"><app-code-block [code]="confirmDialogDraggableCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsConfirmDialog {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly headlessContent = headlessContent;
  protected readonly messageContent = messageContent;
  protected readonly draggableContent = draggableContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly confirmDialogBasicCode = confirmDialogBasicCode;
  protected readonly confirmDialogHeadlessCode = confirmDialogHeadlessCode;
  protected readonly confirmDialogMessageCode = confirmDialogMessageCode;
  protected readonly confirmDialogDraggableCode = confirmDialogDraggableCode;
}
