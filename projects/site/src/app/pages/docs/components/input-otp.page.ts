import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { InputOtpBasicDemo } from './demos/input-otp-basic.demo';

import inputOtpBasicCode from './demos/input-otp-basic.demo.html?raw';
import apiEntries from '../../../../content/api/input-otp.json';
import introContent from '../../../../content/docs/input-otp-intro.txt?raw';

const IMPORT_CODE = `import { InputOtpComponent } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'InputOtp — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'InputOtp component docs: a segmented one-time-passcode input backed by a single string value, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-input-otp',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, InputOtpBasicDemo],
  template: `
    <app-component-doc title="InputOtp" slug="input-otp">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-input-otp-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="inputOtpBasicCode" /></div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsInputOtp {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly inputOtpBasicCode = inputOtpBasicCode;
}
