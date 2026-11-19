import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { TextareaBasicDemo } from './demos/textarea-basic.demo';
import { TextareaAutoresizeDemo } from './demos/textarea-autoresize.demo';

import textareaBasicCode from './demos/textarea-basic.demo.html?raw';
import textareaAutoresizeCode from './demos/textarea-autoresize.demo.html?raw';
import apiEntries from '../../../../content/api/textarea.json';
import introContent from '../../../../content/docs/textarea-intro.txt?raw';
import autoresizeContent from '../../../../content/docs/textarea-autoresize.txt?raw';

const IMPORT_CODE = `import { TextareaDirective } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'Textarea — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Textarea component docs: an attribute directive over a native multi-line field sharing InputText’s styling, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-textarea',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, TextareaBasicDemo, TextareaAutoresizeDemo],
  template: `
    <app-component-doc title="Textarea" slug="textarea">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-textarea-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="textareaBasicCode" /></div>

    <app-prose class="mt-10 block" [content]="autoresizeContent" />
    <div class="mt-4">
      <app-textarea-autoresize-demo />
      <div class="mt-3"><app-code-block [code]="textareaAutoresizeCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsTextarea {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly textareaBasicCode = textareaBasicCode;
  protected readonly autoresizeContent = autoresizeContent;
  protected readonly textareaAutoresizeCode = textareaAutoresizeCode;
}
