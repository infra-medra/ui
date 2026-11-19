import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { FileUploadBasicDemo } from './demos/file-upload-basic.demo';
import { FileUploadRealDemo } from './demos/file-upload-real.demo';

import fileUploadBasicCode from './demos/file-upload-basic.demo.html?raw';
import fileUploadRealCode from './demos/file-upload-real.demo.html?raw';
import apiEntries from '../../../../content/api/file-upload.json';
import introContent from '../../../../content/docs/file-upload-intro.txt?raw';
import realUploadContent from '../../../../content/docs/file-upload-real.txt?raw';

const IMPORT_CODE = `import { FileUploadComponent, type RejectedFile } from '@medra/ui';`;

export const routeMeta: RouteMeta = {
  title: 'FileUpload — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'FileUpload component docs: a validated file picker and pending-file list that hands a plain File[] value to the consumer, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-file-upload',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, FileUploadBasicDemo, FileUploadRealDemo],
  template: `
    <app-component-doc title="FileUpload" slug="file-upload">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-file-upload-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="fileUploadBasicCode" /></div>

    <app-prose class="mt-10 block" [content]="realUploadContent" />
    <div class="mt-4">
      <app-file-upload-real-demo />
      <div class="mt-3"><app-code-block [code]="fileUploadRealCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsFileUpload {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly realUploadContent = realUploadContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly fileUploadBasicCode = fileUploadBasicCode;
  protected readonly fileUploadRealCode = fileUploadRealCode;
}
