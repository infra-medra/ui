import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import installContent from '../../../../content/docs/getting-started-install.txt?raw';
import stylesContent from '../../../../content/docs/getting-started-styles.txt?raw';
import stylesNoteContent from '../../../../content/docs/getting-started-styles-note.txt?raw';

export const routeMeta: RouteMeta = {
  title: 'Installation — MedraUi',
  meta: [{ name: 'description', content: 'Install @medra/ui and add its styles to an Angular app.' }],
};

const installCode = `npm install @medra/ui @angular/cdk`;

const stylesCode = `// angular.json
"styles": [
  "node_modules/@medra/ui/styles.css",
  "src/styles.css"
]`;

@Component({
  selector: 'app-docs-installation',
  imports: [ProseComponent, CodeBlockComponent],
  template: `
    <h1 class="font-display text-3xl font-medium text-surface-900 dark:text-surface-50">Installation</h1>
    <app-prose class="mt-4 block" [content]="installContent" />
    <div class="mt-3"><app-code-block [code]="installCode" /></div>
    <app-prose class="mt-8 block" [content]="stylesContent" />
    <div class="mt-3"><app-code-block [code]="stylesCode" /></div>
    <app-prose class="mt-8 block text-sm" [content]="stylesNoteContent" />

  `,
})
export default class DocsInstallation {
  protected readonly installContent = installContent;
  protected readonly stylesContent = stylesContent;
  protected readonly stylesNoteContent = stylesNoteContent;
  protected readonly installCode = installCode;
  protected readonly stylesCode = stylesCode;
}
