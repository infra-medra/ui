import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { ConfirmPopupBasicDemo } from './demos/confirm-popup-basic.demo';
import { ConfirmPopupHeadlessDemo } from './demos/confirm-popup-headless.demo';
import { ConfirmPopupContentDemo } from './demos/confirm-popup-content.demo';
import { ConfirmPopupAcceptOnlyDemo } from './demos/confirm-popup-accept-only.demo';

import confirmPopupBasicCode from './demos/confirm-popup-basic.demo.html?raw';
import confirmPopupHeadlessCode from './demos/confirm-popup-headless.demo.html?raw';
import confirmPopupContentCode from './demos/confirm-popup-content.demo.html?raw';
import confirmPopupAcceptOnlyCode from './demos/confirm-popup-accept-only.demo.html?raw';
import apiEntries from '../../../../content/api/confirm-popup.json';
import introContent from '../../../../content/docs/confirm-popup-intro.txt?raw';
import headlessContent from '../../../../content/docs/confirm-popup-headless.txt?raw';
import contentTemplateContent from '../../../../content/docs/confirm-popup-content.txt?raw';
import acceptOnlyContent from '../../../../content/docs/confirm-popup-accept-only.txt?raw';

const IMPORT_CODE = `import { ButtonDirective, ConfirmPopupService } from '@medra/ui';`;

export const routeMeta: RouteMeta = {
  title: 'ConfirmPopup — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'ConfirmPopup service docs: an anchored, non-modal Accept/Reject prompt, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-confirm-popup',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, ConfirmPopupBasicDemo, ConfirmPopupHeadlessDemo, ConfirmPopupContentDemo, ConfirmPopupAcceptOnlyDemo],
  template: `
    <app-component-doc title="ConfirmPopup" slug="confirm-popup">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4">
      <app-confirm-popup-basic-demo />
      <div class="mt-3"><app-code-block [code]="confirmPopupBasicCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="headlessContent" />
    <div class="mt-4">
      <app-confirm-popup-headless-demo />
      <div class="mt-3"><app-code-block [code]="confirmPopupHeadlessCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="contentTemplateContent" />
    <div class="mt-4">
      <app-confirm-popup-content-demo />
      <div class="mt-3"><app-code-block [code]="confirmPopupContentCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="acceptOnlyContent" />
    <div class="mt-4">
      <app-confirm-popup-accept-only-demo />
      <div class="mt-3"><app-code-block [code]="confirmPopupAcceptOnlyCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsConfirmPopup {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly headlessContent = headlessContent;
  protected readonly contentTemplateContent = contentTemplateContent;
  protected readonly acceptOnlyContent = acceptOnlyContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly confirmPopupBasicCode = confirmPopupBasicCode;
  protected readonly confirmPopupHeadlessCode = confirmPopupHeadlessCode;
  protected readonly confirmPopupContentCode = confirmPopupContentCode;
  protected readonly confirmPopupAcceptOnlyCode = confirmPopupAcceptOnlyCode;
}
