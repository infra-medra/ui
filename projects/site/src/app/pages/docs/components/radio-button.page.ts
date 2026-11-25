import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { RadioButtonBasicDemo } from './demos/radio-button-basic.demo';
import { RadioButtonDynamicDemo } from './demos/radio-button-dynamic.demo';
import { RadioButtonCardDemo } from './demos/radio-button-card.demo';
import { RadioButtonSizesDemo } from './demos/radio-button-sizes.demo';
import { RadioButtonFilledDemo } from './demos/radio-button-filled.demo';
import { RadioButtonDisabledDemo } from './demos/radio-button-disabled.demo';
import { RadioButtonInvalidDemo } from './demos/radio-button-invalid.demo';
import { RadioButtonSignalFormsDemo } from './demos/radio-button-signal-forms.demo';
import { RadioButtonTemplateDrivenDemo } from './demos/radio-button-template-driven.demo';
import { RadioButtonReactiveFormsDemo } from './demos/radio-button-reactive-forms.demo';

import radioButtonBasicCode from './demos/radio-button-basic.demo.html?raw';
import radioButtonDynamicCode from './demos/radio-button-dynamic.demo.html?raw';
import radioButtonCardCode from './demos/radio-button-card.demo.html?raw';
import radioButtonSizesCode from './demos/radio-button-sizes.demo.html?raw';
import radioButtonFilledCode from './demos/radio-button-filled.demo.html?raw';
import radioButtonDisabledCode from './demos/radio-button-disabled.demo.html?raw';
import radioButtonInvalidCode from './demos/radio-button-invalid.demo.html?raw';
import radioButtonSignalFormsCode from './demos/radio-button-signal-forms.demo.html?raw';
import radioButtonTemplateDrivenCode from './demos/radio-button-template-driven.demo.html?raw';
import radioButtonReactiveFormsCode from './demos/radio-button-reactive-forms.demo.html?raw';

import apiEntries from '../../../../content/api/radio-button.json';
import introContent from '../../../../content/docs/radio-button-intro.txt?raw';
import groupContent from '../../../../content/docs/radio-button-group.txt?raw';
import dynamicContent from '../../../../content/docs/radio-button-dynamic.txt?raw';
import cardContent from '../../../../content/docs/radio-button-card.txt?raw';
import sizesContent from '../../../../content/docs/radio-button-sizes.txt?raw';
import filledContent from '../../../../content/docs/radio-button-filled.txt?raw';
import disabledContent from '../../../../content/docs/radio-button-disabled.txt?raw';
import invalidContent from '../../../../content/docs/radio-button-invalid.txt?raw';
import signalFormsContent from '../../../../content/docs/radio-button-signal-forms.txt?raw';
import templateDrivenContent from '../../../../content/docs/radio-button-template-driven.txt?raw';
import reactiveFormsContent from '../../../../content/docs/radio-button-reactive-forms.txt?raw';

const EXAMPLES = [
  { id: 'example-group', label: 'Group' },
  { id: 'example-dynamic', label: 'Dynamic' },
  { id: 'example-card', label: 'Card' },
  { id: 'example-sizes', label: 'Sizes' },
  { id: 'example-filled', label: 'Filled' },
  { id: 'example-disabled', label: 'Disabled' },
  { id: 'example-invalid', label: 'Invalid' },
  { id: 'example-signal-forms', label: 'Signal Forms' },
  { id: 'example-template-driven', label: 'Template Driven' },
  { id: 'example-reactive-forms', label: 'Reactive Forms' },
] as const;

const IMPORT_CODE = `import { RadioButtonComponent } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'RadioButton — MedraUi',
  meta: [
    {
      name: 'description',
      content:
        'RadioButton component docs: groups, dynamic options, selectable cards, sizes, variants, ControlValueAccessor forms integration, and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-radio-button',
  imports: [
    ComponentDocComponent,
    ProseComponent,
    ApiTableComponent,
    CodeBlockComponent,
    RadioButtonBasicDemo,
    RadioButtonDynamicDemo,
    RadioButtonCardDemo,
    RadioButtonSizesDemo,
    RadioButtonFilledDemo,
    RadioButtonDisabledDemo,
    RadioButtonInvalidDemo,
    RadioButtonSignalFormsDemo,
    RadioButtonTemplateDrivenDemo,
    RadioButtonReactiveFormsDemo,
  ],
  template: `
    <app-component-doc title="RadioButton" slug="radio-button" [examples]="examples">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />

    <app-prose id="example-group" class="mt-10 block scroll-mt-24" [content]="groupContent" />
    <div class="mt-4">
      <app-radio-button-basic-demo />
      <div class="mt-3"><app-code-block [code]="radioButtonBasicCode" /></div>
    </div>

    <app-prose id="example-dynamic" class="mt-10 block scroll-mt-24" [content]="dynamicContent" />
    <div class="mt-4">
      <app-radio-button-dynamic-demo />
      <div class="mt-3"><app-code-block [code]="radioButtonDynamicCode" /></div>
    </div>

    <app-prose id="example-card" class="mt-10 block scroll-mt-24" [content]="cardContent" />
    <div class="mt-4">
      <app-radio-button-card-demo />
      <div class="mt-3"><app-code-block [code]="radioButtonCardCode" /></div>
    </div>

    <app-prose id="example-sizes" class="mt-10 block scroll-mt-24" [content]="sizesContent" />
    <div class="mt-4">
      <app-radio-button-sizes-demo />
      <div class="mt-3"><app-code-block [code]="radioButtonSizesCode" /></div>
    </div>

    <app-prose id="example-filled" class="mt-10 block scroll-mt-24" [content]="filledContent" />
    <div class="mt-4">
      <app-radio-button-filled-demo />
      <div class="mt-3"><app-code-block [code]="radioButtonFilledCode" /></div>
    </div>

    <app-prose id="example-disabled" class="mt-10 block scroll-mt-24" [content]="disabledContent" />
    <div class="mt-4">
      <app-radio-button-disabled-demo />
      <div class="mt-3"><app-code-block [code]="radioButtonDisabledCode" /></div>
    </div>

    <app-prose id="example-invalid" class="mt-10 block scroll-mt-24" [content]="invalidContent" />
    <div class="mt-4">
      <app-radio-button-invalid-demo />
      <div class="mt-3"><app-code-block [code]="radioButtonInvalidCode" /></div>
    </div>

    <app-prose id="example-signal-forms" class="mt-10 block scroll-mt-24" [content]="signalFormsContent" />
    <div class="mt-4">
      <app-radio-button-signal-forms-demo />
      <div class="mt-3"><app-code-block [code]="radioButtonSignalFormsCode" /></div>
    </div>

    <app-prose id="example-template-driven" class="mt-10 block scroll-mt-24" [content]="templateDrivenContent" />
    <div class="mt-4">
      <app-radio-button-template-driven-demo />
      <div class="mt-3"><app-code-block [code]="radioButtonTemplateDrivenCode" /></div>
    </div>

    <app-prose id="example-reactive-forms" class="mt-10 block scroll-mt-24" [content]="reactiveFormsContent" />
    <div class="mt-4">
      <app-radio-button-reactive-forms-demo />
      <div class="mt-3"><app-code-block [code]="radioButtonReactiveFormsCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsRadioButton {
  protected readonly examples = EXAMPLES;
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly groupContent = groupContent;
  protected readonly dynamicContent = dynamicContent;
  protected readonly cardContent = cardContent;
  protected readonly sizesContent = sizesContent;
  protected readonly filledContent = filledContent;
  protected readonly disabledContent = disabledContent;
  protected readonly invalidContent = invalidContent;
  protected readonly signalFormsContent = signalFormsContent;
  protected readonly templateDrivenContent = templateDrivenContent;
  protected readonly reactiveFormsContent = reactiveFormsContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly radioButtonBasicCode = radioButtonBasicCode;
  protected readonly radioButtonDynamicCode = radioButtonDynamicCode;
  protected readonly radioButtonCardCode = radioButtonCardCode;
  protected readonly radioButtonSizesCode = radioButtonSizesCode;
  protected readonly radioButtonFilledCode = radioButtonFilledCode;
  protected readonly radioButtonDisabledCode = radioButtonDisabledCode;
  protected readonly radioButtonInvalidCode = radioButtonInvalidCode;
  protected readonly radioButtonSignalFormsCode = radioButtonSignalFormsCode;
  protected readonly radioButtonTemplateDrivenCode = radioButtonTemplateDrivenCode;
  protected readonly radioButtonReactiveFormsCode = radioButtonReactiveFormsCode;
}
