import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { EditorBasicDemo } from './demos/editor-basic.demo';

import editorBasicCode from './demos/editor-basic.demo.html?raw';
import apiEntries from '../../../../content/api/editor.json';
import introContent from '../../../../content/docs/editor-intro.txt?raw';

const IMPORT_CODE = `import { EditorComponent } from '@medra/ui';`;

export const routeMeta: RouteMeta = {
  title: 'Editor — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Editor component docs: a contenteditable-based rich text editor with a fixed formatting toolbar and sanitized HTML string value, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-editor',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, EditorBasicDemo],
  template: `
    <app-component-doc title="Editor" slug="editor">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-editor-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="editorBasicCode" /></div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsEditor {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly editorBasicCode = editorBasicCode;
}
