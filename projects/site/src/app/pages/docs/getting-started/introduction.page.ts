import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import introContent from '../../../../content/docs/getting-started-intro.txt?raw';
import licenseContent from '../../../../content/docs/getting-started-license.txt?raw';

export const routeMeta: RouteMeta = {
  title: 'Introduction — MedraUi',
  meta: [{ name: 'description', content: 'What MedraUi is and where to go next.' }],
};

@Component({
  selector: 'app-docs-introduction',
  imports: [ProseComponent, CodeBlockComponent],
  template: `
    <h1 class="font-display text-3xl font-medium text-surface-900 dark:text-surface-50">Introduction</h1>
    <app-prose class="mt-4 block" [content]="introContent" />
    <app-prose class="mt-8 block" [content]="licenseContent" />
    <p class="mt-8 text-surface-600 dark:text-surface-400">Continue with <a class="underline" href="/docs/getting-started/installation">Installation</a>.</p>

  `,
})
export default class DocsIntroduction {
  protected readonly introContent = introContent;
  protected readonly licenseContent = licenseContent;
}
