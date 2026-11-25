import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { SelectButtonBasicDemo } from './demos/select-button-basic.demo';
import { SelectButtonMultipleDemo } from './demos/select-button-multiple.demo';
import { SelectButtonTemplateDemo } from './demos/select-button-template.demo';
import { SelectButtonSizesDemo } from './demos/select-button-sizes.demo';
import { SelectButtonFluidDemo } from './demos/select-button-fluid.demo';
import { SelectButtonDisabledDemo } from './demos/select-button-disabled.demo';
import { SelectButtonInvalidDemo } from './demos/select-button-invalid.demo';
import { SelectButtonAllowEmptyDemo } from './demos/select-button-allow-empty.demo';
import { SelectButtonSignalFormsDemo } from './demos/select-button-signal-forms.demo';
import { SelectButtonTemplateDrivenDemo } from './demos/select-button-template-driven.demo';
import { SelectButtonReactiveFormsDemo } from './demos/select-button-reactive-forms.demo';

import selectButtonBasicCode from './demos/select-button-basic.demo.html?raw';
import selectButtonMultipleCode from './demos/select-button-multiple.demo.html?raw';
import selectButtonTemplateCode from './demos/select-button-template.demo.html?raw';
import selectButtonSizesCode from './demos/select-button-sizes.demo.html?raw';
import selectButtonFluidCode from './demos/select-button-fluid.demo.html?raw';
import selectButtonDisabledCode from './demos/select-button-disabled.demo.html?raw';
import selectButtonInvalidCode from './demos/select-button-invalid.demo.html?raw';
import selectButtonAllowEmptyCode from './demos/select-button-allow-empty.demo.html?raw';
import selectButtonSignalFormsCode from './demos/select-button-signal-forms.demo.html?raw';
import selectButtonTemplateDrivenCode from './demos/select-button-template-driven.demo.html?raw';
import selectButtonReactiveFormsCode from './demos/select-button-reactive-forms.demo.html?raw';

import apiEntries from '../../../../content/api/select-button.json';
import introContent from '../../../../content/docs/select-button-intro.txt?raw';
import basicContent from '../../../../content/docs/select-button-basic.txt?raw';
import multipleContent from '../../../../content/docs/select-button-multiple.txt?raw';
import templateContent from '../../../../content/docs/select-button-template.txt?raw';
import sizesContent from '../../../../content/docs/select-button-sizes.txt?raw';
import fluidContent from '../../../../content/docs/select-button-fluid.txt?raw';
import disabledContent from '../../../../content/docs/select-button-disabled.txt?raw';
import invalidContent from '../../../../content/docs/select-button-invalid.txt?raw';
import allowEmptyContent from '../../../../content/docs/select-button-allow-empty.txt?raw';
import signalFormsContent from '../../../../content/docs/select-button-signal-forms.txt?raw';
import templateDrivenContent from '../../../../content/docs/select-button-template-driven.txt?raw';
import reactiveFormsContent from '../../../../content/docs/select-button-reactive-forms.txt?raw';

const EXAMPLES = [
  { id: 'example-basic', label: 'Basic' },
  { id: 'example-multiple', label: 'Multiple' },
  { id: 'example-template', label: 'Template' },
  { id: 'example-sizes', label: 'Sizes' },
  { id: 'example-fluid', label: 'Fluid' },
  { id: 'example-disabled', label: 'Disabled' },
  { id: 'example-invalid', label: 'Invalid' },
  { id: 'example-allow-empty', label: 'Allow Empty' },
  { id: 'example-signal-forms', label: 'Signal Forms' },
  { id: 'example-template-driven', label: 'Template Driven' },
  { id: 'example-reactive-forms', label: 'Reactive Forms' },
] as const;

const IMPORT_CODE = `import { SelectButtonComponent, type SelectOption } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'SelectButton — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'SelectButton component docs: single and multiple selection, sizes, validation states, ControlValueAccessor forms integration, and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-select-button',
  imports: [
    ComponentDocComponent,
    ProseComponent,
    ApiTableComponent,
    CodeBlockComponent,
    SelectButtonBasicDemo,
    SelectButtonMultipleDemo,
    SelectButtonTemplateDemo,
    SelectButtonSizesDemo,
    SelectButtonFluidDemo,
    SelectButtonDisabledDemo,
    SelectButtonInvalidDemo,
    SelectButtonAllowEmptyDemo,
    SelectButtonSignalFormsDemo,
    SelectButtonTemplateDrivenDemo,
    SelectButtonReactiveFormsDemo,
  ],
  template: `
    <app-component-doc title="SelectButton" slug="select-button" [examples]="examples">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />

    <app-prose id="example-basic" class="mt-10 block scroll-mt-24" [content]="basicContent" />
    <div class="mt-4">
      <app-select-button-basic-demo />
      <div class="mt-3"><app-code-block [code]="selectButtonBasicCode" /></div>
    </div>

    <app-prose id="example-multiple" class="mt-10 block scroll-mt-24" [content]="multipleContent" />
    <div class="mt-4">
      <app-select-button-multiple-demo />
      <div class="mt-3"><app-code-block [code]="selectButtonMultipleCode" /></div>
    </div>

    <app-prose id="example-template" class="mt-10 block scroll-mt-24" [content]="templateContent" />
    <div class="mt-4">
      <app-select-button-template-demo />
      <div class="mt-3"><app-code-block [code]="selectButtonTemplateCode" /></div>
    </div>

    <app-prose id="example-sizes" class="mt-10 block scroll-mt-24" [content]="sizesContent" />
    <div class="mt-4">
      <app-select-button-sizes-demo />
      <div class="mt-3"><app-code-block [code]="selectButtonSizesCode" /></div>
    </div>

    <app-prose id="example-fluid" class="mt-10 block scroll-mt-24" [content]="fluidContent" />
    <div class="mt-4">
      <app-select-button-fluid-demo />
      <div class="mt-3"><app-code-block [code]="selectButtonFluidCode" /></div>
    </div>

    <app-prose id="example-disabled" class="mt-10 block scroll-mt-24" [content]="disabledContent" />
    <div class="mt-4">
      <app-select-button-disabled-demo />
      <div class="mt-3"><app-code-block [code]="selectButtonDisabledCode" /></div>
    </div>

    <app-prose id="example-invalid" class="mt-10 block scroll-mt-24" [content]="invalidContent" />
    <div class="mt-4">
      <app-select-button-invalid-demo />
      <div class="mt-3"><app-code-block [code]="selectButtonInvalidCode" /></div>
    </div>

    <app-prose id="example-allow-empty" class="mt-10 block scroll-mt-24" [content]="allowEmptyContent" />
    <div class="mt-4">
      <app-select-button-allow-empty-demo />
      <div class="mt-3"><app-code-block [code]="selectButtonAllowEmptyCode" /></div>
    </div>

    <app-prose id="example-signal-forms" class="mt-10 block scroll-mt-24" [content]="signalFormsContent" />
    <div class="mt-4">
      <app-select-button-signal-forms-demo />
      <div class="mt-3"><app-code-block [code]="selectButtonSignalFormsCode" /></div>
    </div>

    <app-prose id="example-template-driven" class="mt-10 block scroll-mt-24" [content]="templateDrivenContent" />
    <div class="mt-4">
      <app-select-button-template-driven-demo />
      <div class="mt-3"><app-code-block [code]="selectButtonTemplateDrivenCode" /></div>
    </div>

    <app-prose id="example-reactive-forms" class="mt-10 block scroll-mt-24" [content]="reactiveFormsContent" />
    <div class="mt-4">
      <app-select-button-reactive-forms-demo />
      <div class="mt-3"><app-code-block [code]="selectButtonReactiveFormsCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsSelectButton {
  protected readonly examples = EXAMPLES;
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly basicContent = basicContent;
  protected readonly multipleContent = multipleContent;
  protected readonly templateContent = templateContent;
  protected readonly sizesContent = sizesContent;
  protected readonly fluidContent = fluidContent;
  protected readonly disabledContent = disabledContent;
  protected readonly invalidContent = invalidContent;
  protected readonly allowEmptyContent = allowEmptyContent;
  protected readonly signalFormsContent = signalFormsContent;
  protected readonly templateDrivenContent = templateDrivenContent;
  protected readonly reactiveFormsContent = reactiveFormsContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly selectButtonBasicCode = selectButtonBasicCode;
  protected readonly selectButtonMultipleCode = selectButtonMultipleCode;
  protected readonly selectButtonTemplateCode = selectButtonTemplateCode;
  protected readonly selectButtonSizesCode = selectButtonSizesCode;
  protected readonly selectButtonFluidCode = selectButtonFluidCode;
  protected readonly selectButtonDisabledCode = selectButtonDisabledCode;
  protected readonly selectButtonInvalidCode = selectButtonInvalidCode;
  protected readonly selectButtonAllowEmptyCode = selectButtonAllowEmptyCode;
  protected readonly selectButtonSignalFormsCode = selectButtonSignalFormsCode;
  protected readonly selectButtonTemplateDrivenCode = selectButtonTemplateDrivenCode;
  protected readonly selectButtonReactiveFormsCode = selectButtonReactiveFormsCode;
}
