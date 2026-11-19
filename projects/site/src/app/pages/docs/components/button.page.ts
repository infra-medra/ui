import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { ButtonSeveritiesDemo } from './demos/button-severities.demo';
import { ButtonVariantsDemo } from './demos/button-variants.demo';
import { ButtonStatesDemo } from './demos/button-states.demo';
import { ButtonRaisedPlainDemo } from './demos/button-raised-plain.demo';

import buttonSeveritiesCode from './demos/button-severities.demo.html?raw';
import buttonVariantsCode from './demos/button-variants.demo.html?raw';
import buttonStatesCode from './demos/button-states.demo.html?raw';
import buttonRaisedPlainCode from './demos/button-raised-plain.demo.html?raw';
import apiEntries from '../../../../content/api/button.json';
import introContent from '../../../../content/docs/button-intro.txt?raw';
import severitiesContent from '../../../../content/docs/button-severities.txt?raw';
import variantsContent from '../../../../content/docs/button-variants.txt?raw';
import statesContent from '../../../../content/docs/button-states.txt?raw';
import raisedPlainContent from '../../../../content/docs/button-raised-plain.txt?raw';

const IMPORT_CODE = `import { ButtonDirective } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'Button — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Button component docs: severities, variants, sizes, and states, with live examples and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-button',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, ButtonSeveritiesDemo, ButtonVariantsDemo, ButtonStatesDemo, ButtonRaisedPlainDemo],
  template: `
    <app-component-doc title="Button" slug="button">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />

    <app-prose class="mt-10 block" [content]="severitiesContent" />
    <div class="mt-4"><app-button-severities-demo /></div>
    <div class="mt-3"><app-code-block [code]="buttonSeveritiesCode" /></div>

    <app-prose class="mt-10 block" [content]="variantsContent" />
    <div class="mt-4"><app-button-variants-demo /></div>
    <div class="mt-3"><app-code-block [code]="buttonVariantsCode" /></div>

    <app-prose class="mt-10 block" [content]="statesContent" />
    <div class="mt-4"><app-button-states-demo /></div>
    <div class="mt-3"><app-code-block [code]="buttonStatesCode" /></div>

    <app-prose class="mt-10 block" [content]="raisedPlainContent" />
    <div class="mt-4"><app-button-raised-plain-demo /></div>
    <div class="mt-3"><app-code-block [code]="buttonRaisedPlainCode" /></div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsButton {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly severitiesContent = severitiesContent;
  protected readonly variantsContent = variantsContent;
  protected readonly statesContent = statesContent;
  protected readonly raisedPlainContent = raisedPlainContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly buttonSeveritiesCode = buttonSeveritiesCode;
  protected readonly buttonVariantsCode = buttonVariantsCode;
  protected readonly buttonStatesCode = buttonStatesCode;
  protected readonly buttonRaisedPlainCode = buttonRaisedPlainCode;
}
