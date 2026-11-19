import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { InlineMessageBasicDemo } from './demos/inline-message-basic.demo';
import { InlineMessageSeveritiesDemo } from './demos/inline-message-severities.demo';

import inlineMessageBasicCode from './demos/inline-message-basic.demo.html?raw';
import inlineMessageSeveritiesCode from './demos/inline-message-severities.demo.html?raw';
import apiEntries from '../../../../content/api/inline-message.json';
import introContent from '../../../../content/docs/inline-message-intro.txt?raw';
import severitiesContent from '../../../../content/docs/inline-message-severities.txt?raw';

const IMPORT_CODE = `import { InlineMessageComponent, InputTextDirective } from '@medra/ui';`;

export const routeMeta: RouteMeta = {
  title: 'InlineMessage — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'InlineMessage component docs: a compact icon + text hint for form fields, with live examples and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-inline-message',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, InlineMessageBasicDemo, InlineMessageSeveritiesDemo],
  template: `
    <app-component-doc title="InlineMessage" slug="inline-message">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4">
      <app-inline-message-basic-demo />
      <div class="mt-3"><app-code-block [code]="inlineMessageBasicCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="severitiesContent" />
    <div class="mt-4">
      <app-inline-message-severities-demo />
      <div class="mt-3"><app-code-block [code]="inlineMessageSeveritiesCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsInlineMessage {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly severitiesContent = severitiesContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly inlineMessageBasicCode = inlineMessageBasicCode;
  protected readonly inlineMessageSeveritiesCode = inlineMessageSeveritiesCode;
}
