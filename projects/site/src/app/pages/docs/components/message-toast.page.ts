import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { MessageBasicDemo } from './demos/message-basic.demo';
import { MessageCustomizationDemo } from './demos/message-customization.demo';
import { ToastBasicDemo } from './demos/toast-basic.demo';
import { ToastPositionDemo } from './demos/toast-position.demo';
import { ToastHeadlessDemo } from './demos/toast-headless.demo';
import { ToastMessageDemo } from './demos/toast-message.demo';

import messageBasicCode from './demos/message-basic.demo.html?raw';
import messageCustomizationCode from './demos/message-customization.demo.html?raw';
import toastBasicCode from './demos/toast-basic.demo.html?raw';
import toastPositionCode from './demos/toast-position.demo.html?raw';
import toastHeadlessCode from './demos/toast-headless.demo.html?raw';
import toastMessageCode from './demos/toast-message.demo.html?raw';
import apiEntries from '../../../../content/api/message-toast.json';
import introContent from '../../../../content/docs/message-toast-intro.txt?raw';
import messageContent from '../../../../content/docs/message-toast-message.txt?raw';
import toastContent from '../../../../content/docs/message-toast-toast.txt?raw';
import messageCustomizationContent from '../../../../content/docs/message-toast-customization.txt?raw';
import toastPositionContent from '../../../../content/docs/message-toast-position.txt?raw';
import toastHeadlessContent from '../../../../content/docs/message-toast-headless.txt?raw';
import toastMessageContent from '../../../../content/docs/toast-message.txt?raw';

const IMPORT_CODE = `import { MessageComponent, ButtonDirective, ToastService } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'Message / Toast — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Message and Toast component docs: inline status messages, ephemeral notifications, severities, and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-message-toast',
  imports: [ComponentDocComponent, 
    ProseComponent,
    ApiTableComponent,
    CodeBlockComponent,
    MessageBasicDemo,
    MessageCustomizationDemo,
    ToastBasicDemo,
    ToastPositionDemo,
    ToastHeadlessDemo,
    ToastMessageDemo,
  ],
  template: `
    <app-component-doc title="Message / Toast" slug="message-toast">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />

    <app-prose class="mt-10 block" [content]="messageContent" />
    <div class="mt-4">
      <app-message-basic-demo />
      <div class="mt-3"><app-code-block [code]="messageBasicCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="messageCustomizationContent" />
    <div class="mt-4">
      <app-message-customization-demo />
      <div class="mt-3"><app-code-block [code]="messageCustomizationCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="toastContent" />
    <div class="mt-4">
      <app-toast-basic-demo />
      <div class="mt-3"><app-code-block [code]="toastBasicCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="toastPositionContent" />
    <div class="mt-4">
      <app-toast-position-demo />
      <div class="mt-3"><app-code-block [code]="toastPositionCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="toastHeadlessContent" />
    <div class="mt-4">
      <app-toast-headless-demo />
      <div class="mt-3"><app-code-block [code]="toastHeadlessCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="toastMessageContent" />
    <div class="mt-4">
      <app-toast-message-demo />
      <div class="mt-3"><app-code-block [code]="toastMessageCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsMessageToast {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly messageContent = messageContent;
  protected readonly toastContent = toastContent;
  protected readonly messageCustomizationContent = messageCustomizationContent;
  protected readonly toastPositionContent = toastPositionContent;
  protected readonly toastHeadlessContent = toastHeadlessContent;
  protected readonly toastMessageContent = toastMessageContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly messageBasicCode = messageBasicCode;
  protected readonly toastBasicCode = toastBasicCode;
  protected readonly toastPositionCode = toastPositionCode;
  protected readonly messageCustomizationCode = messageCustomizationCode;
  protected readonly toastHeadlessCode = toastHeadlessCode;
  protected readonly toastMessageCode = toastMessageCode;
}
