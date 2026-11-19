import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import iconsContent from '../../../../content/docs/getting-started-icons.txt?raw';
import cdnContent from '../../../../content/docs/getting-started-icons-cdn.txt?raw';

export const routeMeta: RouteMeta = {
  title: 'Icons — MedraUi',
  meta: [{ name: 'description', content: 'Register icons or load a CDN icon font for MedraUi.' }],
};

const iconsCode = `// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { heroOutlineIcons, heroMiniIcons, provideIcons } from '@medra/ui';

export const appConfig: ApplicationConfig = {
  providers: [
    provideIcons({
      outline: { chevronDown: heroOutlineIcons.chevronDown },
      mini: { check: heroMiniIcons.check, xMark: heroMiniIcons.xMark },
    }),
    // ...your other providers
  ],
};`;

const cdnCode = `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />

<med-icon fontIcon="fa-solid fa-house" />`;

@Component({
  selector: 'app-docs-icons',
  imports: [ProseComponent, CodeBlockComponent],
  template: `
    <h1 class="font-display text-3xl font-medium text-surface-900 dark:text-surface-50">Icons</h1>
    <app-prose class="mt-4 block" [content]="iconsContent" />
    <div class="mt-3"><app-code-block [code]="iconsCode" /></div>
    <app-prose class="mt-8 block" [content]="cdnContent" />
    <div class="mt-3"><app-code-block [code]="cdnCode" /></div>

  `,
})
export default class DocsIcons {
  protected readonly iconsContent = iconsContent;
  protected readonly cdnContent = cdnContent;
  protected readonly iconsCode = iconsCode;
  protected readonly cdnCode = cdnCode;
}
