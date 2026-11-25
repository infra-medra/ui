import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { InputTextBasicDemo } from './demos/input-text-basic.demo';
import { InputTextClearIconDemo } from './demos/input-text-clear-icon.demo';
import { InputTextFilledDemo } from './demos/input-text-filled.demo';
import { InputTextFloatLabelDemo } from './demos/input-text-float-label.demo';
import { InputTextIftaLabelDemo } from './demos/input-text-ifta-label.demo';
import { InputTextSizesDemo } from './demos/input-text-sizes.demo';
import { InputTextFluidDemo } from './demos/input-text-fluid.demo';
import { InputTextHelpTextDemo } from './demos/input-text-help-text.demo';
import { InputTextDisabledDemo } from './demos/input-text-disabled.demo';
import { InputTextInvalidDemo } from './demos/input-text-invalid.demo';
import { InputTextSignalFormsDemo } from './demos/input-text-signal-forms.demo';
import { InputTextTemplateDrivenDemo } from './demos/input-text-template-driven.demo';
import { InputTextReactiveFormsDemo } from './demos/input-text-reactive-forms.demo';

import inputTextBasicCode from './demos/input-text-basic.demo.html?raw';
import inputTextClearIconCode from './demos/input-text-clear-icon.demo.html?raw';
import inputTextFilledCode from './demos/input-text-filled.demo.html?raw';
import inputTextFloatLabelCode from './demos/input-text-float-label.demo.html?raw';
import inputTextIftaLabelCode from './demos/input-text-ifta-label.demo.html?raw';
import inputTextSizesCode from './demos/input-text-sizes.demo.html?raw';
import inputTextFluidCode from './demos/input-text-fluid.demo.html?raw';
import inputTextHelpTextCode from './demos/input-text-help-text.demo.html?raw';
import inputTextDisabledCode from './demos/input-text-disabled.demo.html?raw';
import inputTextInvalidCode from './demos/input-text-invalid.demo.html?raw';
import inputTextSignalFormsCode from './demos/input-text-signal-forms.demo.html?raw';
import inputTextTemplateDrivenCode from './demos/input-text-template-driven.demo.html?raw';
import inputTextReactiveFormsCode from './demos/input-text-reactive-forms.demo.html?raw';

import apiEntries from '../../../../content/api/input-text.json';
import introContent from '../../../../content/docs/input-text-intro.txt?raw';
import basicContent from '../../../../content/docs/input-text-basic.txt?raw';
import clearIconContent from '../../../../content/docs/input-text-clear-icon.txt?raw';
import filledContent from '../../../../content/docs/input-text-filled.txt?raw';
import floatLabelContent from '../../../../content/docs/input-text-float-label.txt?raw';
import iftaLabelContent from '../../../../content/docs/input-text-ifta-label.txt?raw';
import sizesContent from '../../../../content/docs/input-text-sizes.txt?raw';
import fluidContent from '../../../../content/docs/input-text-fluid.txt?raw';
import helpTextContent from '../../../../content/docs/input-text-help-text.txt?raw';
import disabledContent from '../../../../content/docs/input-text-disabled.txt?raw';
import invalidContent from '../../../../content/docs/input-text-invalid.txt?raw';
import signalFormsContent from '../../../../content/docs/input-text-signal-forms.txt?raw';
import templateDrivenContent from '../../../../content/docs/input-text-template-driven.txt?raw';
import reactiveFormsContent from '../../../../content/docs/input-text-reactive-forms.txt?raw';

const EXAMPLES = [
  { id: 'example-basic', label: 'Basic' },
  { id: 'example-clear-icon', label: 'Clear Icon' },
  { id: 'example-filled', label: 'Filled' },
  { id: 'example-float-label', label: 'Float Label' },
  { id: 'example-ifta-label', label: 'Ifta Label' },
  { id: 'example-sizes', label: 'Sizes' },
  { id: 'example-fluid', label: 'Fluid' },
  { id: 'example-help-text', label: 'Help Text' },
  { id: 'example-disabled', label: 'Disabled' },
  { id: 'example-invalid', label: 'Invalid' },
  { id: 'example-signal-forms', label: 'Signal Forms' },
  { id: 'example-template-driven', label: 'Template Driven' },
  { id: 'example-reactive-forms', label: 'Reactive Forms' },
] as const;

const IMPORT_CODE = `import { InputTextDirective } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'InputText — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'InputText component docs: variants, labels, sizes, states, ControlValueAccessor forms integration, and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-input-text',
  imports: [
    ComponentDocComponent,
    ProseComponent,
    ApiTableComponent,
    CodeBlockComponent,
    InputTextBasicDemo,
    InputTextClearIconDemo,
    InputTextFilledDemo,
    InputTextFloatLabelDemo,
    InputTextIftaLabelDemo,
    InputTextSizesDemo,
    InputTextFluidDemo,
    InputTextHelpTextDemo,
    InputTextDisabledDemo,
    InputTextInvalidDemo,
    InputTextSignalFormsDemo,
    InputTextTemplateDrivenDemo,
    InputTextReactiveFormsDemo,
  ],
  template: `
    <app-component-doc title="InputText" slug="input-text" [examples]="examples">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />

    <app-prose id="example-basic" class="mt-10 block scroll-mt-24" [content]="basicContent" />
    <div class="mt-4">
      <app-input-text-basic-demo />
      <div class="mt-3"><app-code-block [code]="inputTextBasicCode" /></div>
    </div>

    <app-prose id="example-clear-icon" class="mt-10 block scroll-mt-24" [content]="clearIconContent" />
    <div class="mt-4">
      <app-input-text-clear-icon-demo />
      <div class="mt-3"><app-code-block [code]="inputTextClearIconCode" /></div>
    </div>

    <app-prose id="example-filled" class="mt-10 block scroll-mt-24" [content]="filledContent" />
    <div class="mt-4">
      <app-input-text-filled-demo />
      <div class="mt-3"><app-code-block [code]="inputTextFilledCode" /></div>
    </div>

    <app-prose id="example-float-label" class="mt-10 block scroll-mt-24" [content]="floatLabelContent" />
    <div class="mt-4">
      <app-input-text-float-label-demo />
      <div class="mt-3"><app-code-block [code]="inputTextFloatLabelCode" /></div>
    </div>

    <app-prose id="example-ifta-label" class="mt-10 block scroll-mt-24" [content]="iftaLabelContent" />
    <div class="mt-4">
      <app-input-text-ifta-label-demo />
      <div class="mt-3"><app-code-block [code]="inputTextIftaLabelCode" /></div>
    </div>

    <app-prose id="example-sizes" class="mt-10 block scroll-mt-24" [content]="sizesContent" />
    <div class="mt-4">
      <app-input-text-sizes-demo />
      <div class="mt-3"><app-code-block [code]="inputTextSizesCode" /></div>
    </div>

    <app-prose id="example-fluid" class="mt-10 block scroll-mt-24" [content]="fluidContent" />
    <div class="mt-4">
      <app-input-text-fluid-demo />
      <div class="mt-3"><app-code-block [code]="inputTextFluidCode" /></div>
    </div>

    <app-prose id="example-help-text" class="mt-10 block scroll-mt-24" [content]="helpTextContent" />
    <div class="mt-4">
      <app-input-text-help-text-demo />
      <div class="mt-3"><app-code-block [code]="inputTextHelpTextCode" /></div>
    </div>

    <app-prose id="example-disabled" class="mt-10 block scroll-mt-24" [content]="disabledContent" />
    <div class="mt-4">
      <app-input-text-disabled-demo />
      <div class="mt-3"><app-code-block [code]="inputTextDisabledCode" /></div>
    </div>

    <app-prose id="example-invalid" class="mt-10 block scroll-mt-24" [content]="invalidContent" />
    <div class="mt-4">
      <app-input-text-invalid-demo />
      <div class="mt-3"><app-code-block [code]="inputTextInvalidCode" /></div>
    </div>

    <app-prose id="example-signal-forms" class="mt-10 block scroll-mt-24" [content]="signalFormsContent" />
    <div class="mt-4">
      <app-input-text-signal-forms-demo />
      <div class="mt-3"><app-code-block [code]="inputTextSignalFormsCode" /></div>
    </div>

    <app-prose id="example-template-driven" class="mt-10 block scroll-mt-24" [content]="templateDrivenContent" />
    <div class="mt-4">
      <app-input-text-template-driven-demo />
      <div class="mt-3"><app-code-block [code]="inputTextTemplateDrivenCode" /></div>
    </div>

    <app-prose id="example-reactive-forms" class="mt-10 block scroll-mt-24" [content]="reactiveFormsContent" />
    <div class="mt-4">
      <app-input-text-reactive-forms-demo />
      <div class="mt-3"><app-code-block [code]="inputTextReactiveFormsCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsInputText {
  protected readonly examples = EXAMPLES;
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly basicContent = basicContent;
  protected readonly clearIconContent = clearIconContent;
  protected readonly filledContent = filledContent;
  protected readonly floatLabelContent = floatLabelContent;
  protected readonly iftaLabelContent = iftaLabelContent;
  protected readonly sizesContent = sizesContent;
  protected readonly fluidContent = fluidContent;
  protected readonly helpTextContent = helpTextContent;
  protected readonly disabledContent = disabledContent;
  protected readonly invalidContent = invalidContent;
  protected readonly signalFormsContent = signalFormsContent;
  protected readonly templateDrivenContent = templateDrivenContent;
  protected readonly reactiveFormsContent = reactiveFormsContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly inputTextBasicCode = inputTextBasicCode;
  protected readonly inputTextClearIconCode = inputTextClearIconCode;
  protected readonly inputTextFilledCode = inputTextFilledCode;
  protected readonly inputTextFloatLabelCode = inputTextFloatLabelCode;
  protected readonly inputTextIftaLabelCode = inputTextIftaLabelCode;
  protected readonly inputTextSizesCode = inputTextSizesCode;
  protected readonly inputTextFluidCode = inputTextFluidCode;
  protected readonly inputTextHelpTextCode = inputTextHelpTextCode;
  protected readonly inputTextDisabledCode = inputTextDisabledCode;
  protected readonly inputTextInvalidCode = inputTextInvalidCode;
  protected readonly inputTextSignalFormsCode = inputTextSignalFormsCode;
  protected readonly inputTextTemplateDrivenCode = inputTextTemplateDrivenCode;
  protected readonly inputTextReactiveFormsCode = inputTextReactiveFormsCode;
}
