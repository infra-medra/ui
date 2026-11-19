import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ProseComponent } from '../../shared/prose';
import { CodeBlockComponent } from '../../shared/code-block';

import introContent from '../../../content/docs/getting-started-intro.txt?raw';
import installContent from '../../../content/docs/getting-started-install.txt?raw';
import stylesContent from '../../../content/docs/getting-started-styles.txt?raw';
import stylesNoteContent from '../../../content/docs/getting-started-styles-note.txt?raw';
import iconsContent from '../../../content/docs/getting-started-icons.txt?raw';
import usageContent from '../../../content/docs/getting-started-usage.txt?raw';
import licenseContent from '../../../content/docs/getting-started-license.txt?raw';

export const routeMeta: RouteMeta = {
  title: 'Getting started — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'How to install @medra.dev/ui, add its styles, register icons, and render your first component in an Angular app.',
    },
  ],
};

const INSTALL_CODE = `npm install @medra.dev/ui @angular/cdk`;

const STYLES_CODE = `// angular.json
"styles": [
  "node_modules/@medra.dev/ui/styles.css",
  "src/styles.css"
]`;

const ICONS_CODE = `// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { heroOutlineIcons, heroMiniIcons, provideIcons } from '@medra.dev/ui';

export const appConfig: ApplicationConfig = {
  providers: [
    provideIcons({
      outline: { chevronDown: heroOutlineIcons.chevronDown },
      mini: { check: heroMiniIcons.check, xMark: heroMiniIcons.xMark },
    }),
    // ...your other providers
  ],
};`;

const USAGE_CODE = `import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-terms',
  imports: [FormsModule, CheckboxComponent],
  template: \`
    <label class="flex items-center gap-2">
      <med-checkbox [(ngModel)]="accepted" />
      Accept the terms
    </label>
  \`,
})
export class TermsComponent {
  protected accepted = false;
}`;

@Component({
  selector: 'app-docs-index',
  imports: [ProseComponent, CodeBlockComponent],
  template: `
    <h1 class="font-display text-3xl font-medium text-surface-900 dark:text-surface-50">Getting started</h1>

    <app-prose class="mt-4 block" [content]="introContent" />

    <app-prose class="mt-8 block" [content]="installContent" />
    <div class="mt-3"><app-code-block [code]="installCode" /></div>

    <app-prose class="mt-8 block" [content]="stylesContent" />
    <div class="mt-3"><app-code-block [code]="stylesCode" /></div>
    <app-prose class="mt-3 block text-sm" [content]="stylesNoteContent" />

    <app-prose class="mt-8 block" [content]="iconsContent" />
    <div class="mt-3"><app-code-block [code]="iconsCode" /></div>

    <app-prose class="mt-8 block" [content]="usageContent" />
    <div class="mt-3"><app-code-block [code]="usageCode" /></div>

    <app-prose class="mt-8 block" [content]="licenseContent" />

    <p class="mt-8 text-surface-600 dark:text-surface-400">
      Pick a component from the sidebar for a live, interactive example plus the full API
      reference, generated straight from the library's own source.
    </p>
  `,
})
export default class DocsIndex {
  protected readonly introContent = introContent;
  protected readonly installContent = installContent;
  protected readonly stylesContent = stylesContent;
  protected readonly stylesNoteContent = stylesNoteContent;
  protected readonly iconsContent = iconsContent;
  protected readonly usageContent = usageContent;
  protected readonly licenseContent = licenseContent;

  protected readonly installCode = INSTALL_CODE;
  protected readonly stylesCode = STYLES_CODE;
  protected readonly iconsCode = ICONS_CODE;
  protected readonly usageCode = USAGE_CODE;
}
