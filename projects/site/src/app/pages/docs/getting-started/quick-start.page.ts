import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import usageContent from '../../../../content/docs/getting-started-usage.txt?raw';

export const routeMeta: RouteMeta = {
  title: 'Quick start — MedraUi',
  meta: [{ name: 'description', content: 'Render your first MedraUi component in an Angular app.' }],
};

const usageCode = `import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxComponent } from '@medra/ui';

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
  selector: 'app-docs-quick-start',
  imports: [ProseComponent, CodeBlockComponent],
  template: `
    <h1 class="font-display text-3xl font-medium text-surface-900 dark:text-surface-50">Quick start</h1>
    <app-prose class="mt-4 block" [content]="usageContent" />
    <div class="mt-3"><app-code-block [code]="usageCode" /></div>

  `,
})
export default class DocsQuickStart {
  protected readonly usageContent = usageContent;
  protected readonly usageCode = usageCode;
}
