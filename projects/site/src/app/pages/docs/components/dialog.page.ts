import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { DialogBasicDemo } from './demos/dialog-basic.demo';
import { DialogTemplateDemo } from './demos/dialog-template.demo';
import { DialogPositionDemo } from './demos/dialog-position.demo';
import { DialogMaximizableDemo } from './demos/dialog-maximizable.demo';
import { DialogDraggableDemo } from './demos/dialog-draggable.demo';
import { DialogResizableDemo } from './demos/dialog-resizable.demo';
import { DialogLongContentDemo } from './demos/dialog-long-content.demo';
import { DialogHeadlessDemo } from './demos/dialog-headless.demo';
import { DialogBehaviorDemo } from './demos/dialog-behavior.demo';
import { DialogWithoutModalDemo } from './demos/dialog-without-modal.demo';

import dialogBasicCode from './demos/dialog-basic.demo.html?raw';
import dialogBasicTsCode from './demos/dialog-basic.demo.ts?raw';
import dialogTemplateCode from './demos/dialog-template.demo.html?raw';
import dialogPositionCode from './demos/dialog-position.demo.html?raw';
import dialogMaximizableCode from './demos/dialog-maximizable.demo.html?raw';
import dialogDraggableCode from './demos/dialog-draggable.demo.html?raw';
import dialogDraggableTsCode from './demos/dialog-draggable.demo.ts?raw';
import dialogResizableCode from './demos/dialog-resizable.demo.html?raw';
import dialogResizableTsCode from './demos/dialog-resizable.demo.ts?raw';
import dialogLongContentCode from './demos/dialog-long-content.demo.html?raw';
import dialogHeadlessCode from './demos/dialog-headless.demo.html?raw';
import dialogBehaviorCode from './demos/dialog-behavior.demo.html?raw';
import dialogBehaviorTsCode from './demos/dialog-behavior.demo.ts?raw';
import dialogWithoutModalCode from './demos/dialog-without-modal.demo.html?raw';
import dialogWithoutModalTsCode from './demos/dialog-without-modal.demo.ts?raw';
import apiEntries from '../../../../content/api/dialog.json';
import introContent from '../../../../content/docs/dialog-intro.txt?raw';
import basicContent from '../../../../content/docs/dialog-basic.txt?raw';
import templateContent from '../../../../content/docs/dialog-template.txt?raw';
import positionContent from '../../../../content/docs/dialog-position.txt?raw';
import maximizableContent from '../../../../content/docs/dialog-maximizable.txt?raw';
import draggableContent from '../../../../content/docs/dialog-draggable.txt?raw';
import resizableContent from '../../../../content/docs/dialog-resizable.txt?raw';
import longContentContent from '../../../../content/docs/dialog-long-content.txt?raw';
import headlessContent from '../../../../content/docs/dialog-headless.txt?raw';
import behaviorContent from '../../../../content/docs/dialog-behavior.txt?raw';
import withoutModalContent from '../../../../content/docs/dialog-without-modal.txt?raw';

const EXAMPLES = [
  { id: 'example-basic', label: 'Basic' },
  { id: 'example-template', label: 'Template' },
  { id: 'example-position', label: 'Position' },
  { id: 'example-maximizable', label: 'Maximizable' },
  { id: 'example-draggable', label: 'Draggable' },
  { id: 'example-resizable', label: 'Resizable' },
  { id: 'example-long-content', label: 'Long Content' },
  { id: 'example-headless', label: 'Headless' },
  { id: 'example-responsive-dismissal', label: 'Responsive & Dismissal' },
  { id: 'example-without-modal', label: 'Without Modal' },
] as const;

const IMPORT_CODE = `import { ButtonDirective, DialogComponent, DialogService } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'Dialog — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Dialog component and service docs: declarative templates, positioning, maximizable/draggable/resizable windows, headless mode, and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-dialog',
  imports: [
    ComponentDocComponent,
    ProseComponent,
    ApiTableComponent,
    CodeBlockComponent,
    DialogBasicDemo,
    DialogTemplateDemo,
    DialogPositionDemo,
    DialogMaximizableDemo,
    DialogDraggableDemo,
    DialogResizableDemo,
    DialogLongContentDemo,
    DialogHeadlessDemo,
    DialogBehaviorDemo,
    DialogWithoutModalDemo,
  ],
  template: `
    <app-component-doc title="Dialog" slug="dialog" [examples]="examples">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />

    <app-prose id="example-basic" class="mt-10 block scroll-mt-24" [content]="basicContent" />
    <div class="mt-4">
      <app-dialog-basic-demo />
      <div class="mt-3"><app-code-block [code]="dialogBasicCode" /></div>
      <div class="mt-3"><app-code-block [code]="dialogBasicTsCode" /></div>
    </div>

    <app-prose id="example-template" class="mt-10 block scroll-mt-24" [content]="templateContent" />
    <div class="mt-4">
      <app-dialog-template-demo />
      <div class="mt-3"><app-code-block [code]="dialogTemplateCode" /></div>
    </div>

    <app-prose id="example-position" class="mt-10 block scroll-mt-24" [content]="positionContent" />
    <div class="mt-4">
      <app-dialog-position-demo />
      <div class="mt-3"><app-code-block [code]="dialogPositionCode" /></div>
    </div>

    <app-prose id="example-maximizable" class="mt-10 block scroll-mt-24" [content]="maximizableContent" />
    <div class="mt-4">
      <app-dialog-maximizable-demo />
      <div class="mt-3"><app-code-block [code]="dialogMaximizableCode" /></div>
    </div>

    <app-prose id="example-draggable" class="mt-10 block scroll-mt-24" [content]="draggableContent" />
    <div class="mt-4">
      <app-dialog-draggable-demo />
      <div class="mt-3"><app-code-block [code]="dialogDraggableCode" /></div>
      <div class="mt-3"><app-code-block [code]="dialogDraggableTsCode" /></div>
    </div>

    <app-prose id="example-resizable" class="mt-10 block scroll-mt-24" [content]="resizableContent" />
    <div class="mt-4">
      <app-dialog-resizable-demo />
      <div class="mt-3"><app-code-block [code]="dialogResizableCode" /></div>
      <div class="mt-3"><app-code-block [code]="dialogResizableTsCode" /></div>
    </div>

    <app-prose id="example-long-content" class="mt-10 block scroll-mt-24" [content]="longContentContent" />
    <div class="mt-4">
      <app-dialog-long-content-demo />
      <div class="mt-3"><app-code-block [code]="dialogLongContentCode" /></div>
    </div>

    <app-prose id="example-headless" class="mt-10 block scroll-mt-24" [content]="headlessContent" />
    <div class="mt-4">
      <app-dialog-headless-demo />
      <div class="mt-3"><app-code-block [code]="dialogHeadlessCode" /></div>
    </div>

    <app-prose id="example-responsive-dismissal" class="mt-10 block scroll-mt-24" [content]="behaviorContent" />
    <div class="mt-4">
      <app-dialog-behavior-demo />
      <div class="mt-3"><app-code-block [code]="dialogBehaviorCode" /></div>
      <div class="mt-3"><app-code-block [code]="dialogBehaviorTsCode" /></div>
    </div>

    <app-prose id="example-without-modal" class="mt-10 block scroll-mt-24" [content]="withoutModalContent" />
    <div class="mt-4">
      <app-dialog-without-modal-demo />
      <div class="mt-3"><app-code-block [code]="dialogWithoutModalCode" /></div>
      <div class="mt-3"><app-code-block [code]="dialogWithoutModalTsCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsDialog {
  protected readonly examples = EXAMPLES;
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly basicContent = basicContent;
  protected readonly templateContent = templateContent;
  protected readonly positionContent = positionContent;
  protected readonly maximizableContent = maximizableContent;
  protected readonly draggableContent = draggableContent;
  protected readonly resizableContent = resizableContent;
  protected readonly longContentContent = longContentContent;
  protected readonly headlessContent = headlessContent;
  protected readonly behaviorContent = behaviorContent;
  protected readonly withoutModalContent = withoutModalContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly dialogBasicCode = dialogBasicCode;
  protected readonly dialogBasicTsCode = dialogBasicTsCode;
  protected readonly dialogTemplateCode = dialogTemplateCode;
  protected readonly dialogPositionCode = dialogPositionCode;
  protected readonly dialogMaximizableCode = dialogMaximizableCode;
  protected readonly dialogDraggableCode = dialogDraggableCode;
  protected readonly dialogDraggableTsCode = dialogDraggableTsCode;
  protected readonly dialogResizableCode = dialogResizableCode;
  protected readonly dialogResizableTsCode = dialogResizableTsCode;
  protected readonly dialogLongContentCode = dialogLongContentCode;
  protected readonly dialogHeadlessCode = dialogHeadlessCode;
  protected readonly dialogBehaviorCode = dialogBehaviorCode;
  protected readonly dialogBehaviorTsCode = dialogBehaviorTsCode;
  protected readonly dialogWithoutModalCode = dialogWithoutModalCode;
  protected readonly dialogWithoutModalTsCode = dialogWithoutModalTsCode;
}
