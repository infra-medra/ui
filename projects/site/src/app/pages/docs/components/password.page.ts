import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { PasswordBasicDemo } from './demos/password-basic.demo';

import passwordBasicCode from './demos/password-basic.demo.html?raw';
import apiEntries from '../../../../content/api/password.json';
import introContent from '../../../../content/docs/password-intro.txt?raw';

const IMPORT_CODE = `import { PasswordComponent } from '@medra/ui';`;

export const routeMeta: RouteMeta = {
  title: 'Password — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Password component docs: a native masked input with an optional reveal toggle, a live strength-meter panel, and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-password',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, PasswordBasicDemo],
  template: `
    <app-component-doc title="Password" slug="password">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4">
      <app-password-basic-demo />
      <div class="mt-3"><app-code-block [code]="passwordBasicCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsPassword {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly passwordBasicCode = passwordBasicCode;
}
