import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { InputNumberBasicDemo } from './demos/input-number-basic.demo';
import { InputNumberNumeralsDemo } from './demos/input-number-numerals.demo';
import { InputNumberLocaleDemo } from './demos/input-number-locale.demo';
import { InputNumberCurrencyDemo } from './demos/input-number-currency.demo';
import { InputNumberPrefixSuffixDemo } from './demos/input-number-prefix-suffix.demo';
import { InputNumberButtonsDemo } from './demos/input-number-buttons.demo';
import { InputNumberClearIconDemo } from './demos/input-number-clear-icon.demo';
import { InputNumberFloatLabelDemo } from './demos/input-number-float-label.demo';
import { InputNumberIftaLabelDemo } from './demos/input-number-ifta-label.demo';
import { InputNumberSizesDemo } from './demos/input-number-sizes.demo';
import { InputNumberFluidDemo } from './demos/input-number-fluid.demo';
import { InputNumberFilledDemo } from './demos/input-number-filled.demo';
import { InputNumberDisabledDemo } from './demos/input-number-disabled.demo';
import { InputNumberInvalidDemo } from './demos/input-number-invalid.demo';
import { InputNumberSignalFormsDemo } from './demos/input-number-signal-forms.demo';
import { InputNumberTemplateDrivenDemo } from './demos/input-number-template-driven.demo';
import { InputNumberReactiveFormsDemo } from './demos/input-number-reactive-forms.demo';

import inputNumberBasicCode from './demos/input-number-basic.demo.html?raw';
import inputNumberNumeralsCode from './demos/input-number-numerals.demo.html?raw';
import inputNumberLocaleCode from './demos/input-number-locale.demo.html?raw';
import inputNumberCurrencyCode from './demos/input-number-currency.demo.html?raw';
import inputNumberPrefixSuffixCode from './demos/input-number-prefix-suffix.demo.html?raw';
import inputNumberButtonsCode from './demos/input-number-buttons.demo.html?raw';
import inputNumberClearIconCode from './demos/input-number-clear-icon.demo.html?raw';
import inputNumberFloatLabelCode from './demos/input-number-float-label.demo.html?raw';
import inputNumberIftaLabelCode from './demos/input-number-ifta-label.demo.html?raw';
import inputNumberSizesCode from './demos/input-number-sizes.demo.html?raw';
import inputNumberFluidCode from './demos/input-number-fluid.demo.html?raw';
import inputNumberFilledCode from './demos/input-number-filled.demo.html?raw';
import inputNumberDisabledCode from './demos/input-number-disabled.demo.html?raw';
import inputNumberInvalidCode from './demos/input-number-invalid.demo.html?raw';
import inputNumberSignalFormsCode from './demos/input-number-signal-forms.demo.html?raw';
import inputNumberTemplateDrivenCode from './demos/input-number-template-driven.demo.html?raw';
import inputNumberReactiveFormsCode from './demos/input-number-reactive-forms.demo.html?raw';
import apiEntries from '../../../../content/api/input-number.json';
import introContent from '../../../../content/docs/input-number-intro.txt?raw';
import basicContent from '../../../../content/docs/input-number-basic.txt?raw';
import numeralsContent from '../../../../content/docs/input-number-numerals.txt?raw';
import localeContent from '../../../../content/docs/input-number-locale.txt?raw';
import currencyContent from '../../../../content/docs/input-number-currency.txt?raw';
import prefixSuffixContent from '../../../../content/docs/input-number-prefix-suffix.txt?raw';
import buttonsContent from '../../../../content/docs/input-number-buttons.txt?raw';
import clearIconContent from '../../../../content/docs/input-number-clear-icon.txt?raw';
import floatLabelContent from '../../../../content/docs/input-number-float-label.txt?raw';
import iftaLabelContent from '../../../../content/docs/input-number-ifta-label.txt?raw';
import sizesContent from '../../../../content/docs/input-number-sizes.txt?raw';
import fluidContent from '../../../../content/docs/input-number-fluid.txt?raw';
import filledContent from '../../../../content/docs/input-number-filled.txt?raw';
import disabledContent from '../../../../content/docs/input-number-disabled.txt?raw';
import invalidContent from '../../../../content/docs/input-number-invalid.txt?raw';
import signalFormsContent from '../../../../content/docs/input-number-signal-forms.txt?raw';
import templateDrivenContent from '../../../../content/docs/input-number-template-driven.txt?raw';
import reactiveFormsContent from '../../../../content/docs/input-number-reactive-forms.txt?raw';

const EXAMPLES = [
  { id: 'example-basic', label: 'Basic' },
  { id: 'example-numerals', label: 'Numerals' },
  { id: 'example-locale', label: 'Locale' },
  { id: 'example-currency', label: 'Currency' },
  { id: 'example-prefix-suffix', label: 'Prefix & Suffix' },
  { id: 'example-buttons', label: 'Buttons' },
  { id: 'example-clear-icon', label: 'Clear Icon' },
  { id: 'example-float-label', label: 'Float Label' },
  { id: 'example-ifta-label', label: 'Ifta Label' },
  { id: 'example-sizes', label: 'Sizes' },
  { id: 'example-fluid', label: 'Fluid' },
  { id: 'example-filled', label: 'Filled' },
  { id: 'example-disabled', label: 'Disabled' },
  { id: 'example-invalid', label: 'Invalid' },
  { id: 'example-signal-forms', label: 'Signal Forms' },
  { id: 'example-template-driven', label: 'Template Driven' },
  { id: 'example-reactive-forms', label: 'Reactive Forms' },
] as const;

const IMPORT_CODE = `import { InputNumberComponent } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'InputNumber — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'InputNumber component docs: a keyboard-driven spinbutton input with Intl.NumberFormat-backed locale, currency, and grouping support, with live examples and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-input-number',
  imports: [
    ComponentDocComponent,
    ProseComponent,
    ApiTableComponent,
    CodeBlockComponent,
    InputNumberBasicDemo,
    InputNumberNumeralsDemo,
    InputNumberLocaleDemo,
    InputNumberCurrencyDemo,
    InputNumberPrefixSuffixDemo,
    InputNumberButtonsDemo,
    InputNumberClearIconDemo,
    InputNumberFloatLabelDemo,
    InputNumberIftaLabelDemo,
    InputNumberSizesDemo,
    InputNumberFluidDemo,
    InputNumberFilledDemo,
    InputNumberDisabledDemo,
    InputNumberInvalidDemo,
    InputNumberSignalFormsDemo,
    InputNumberTemplateDrivenDemo,
    InputNumberReactiveFormsDemo,
  ],
  template: `
    <app-component-doc title="InputNumber" slug="input-number" [examples]="examples">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />

    <app-prose id="example-basic" class="mt-10 block scroll-mt-24" [content]="basicContent" />
    <div class="mt-4">
      <app-input-number-basic-demo />
      <div class="mt-3"><app-code-block [code]="inputNumberBasicCode" /></div>
    </div>

    <app-prose id="example-numerals" class="mt-10 block scroll-mt-24" [content]="numeralsContent" />
    <div class="mt-4">
      <app-input-number-numerals-demo />
      <div class="mt-3"><app-code-block [code]="inputNumberNumeralsCode" /></div>
    </div>

    <app-prose id="example-locale" class="mt-10 block scroll-mt-24" [content]="localeContent" />
    <div class="mt-4">
      <app-input-number-locale-demo />
      <div class="mt-3"><app-code-block [code]="inputNumberLocaleCode" /></div>
    </div>

    <app-prose id="example-currency" class="mt-10 block scroll-mt-24" [content]="currencyContent" />
    <div class="mt-4">
      <app-input-number-currency-demo />
      <div class="mt-3"><app-code-block [code]="inputNumberCurrencyCode" /></div>
    </div>

    <app-prose id="example-prefix-suffix" class="mt-10 block scroll-mt-24" [content]="prefixSuffixContent" />
    <div class="mt-4">
      <app-input-number-prefix-suffix-demo />
      <div class="mt-3"><app-code-block [code]="inputNumberPrefixSuffixCode" /></div>
    </div>

    <app-prose id="example-buttons" class="mt-10 block scroll-mt-24" [content]="buttonsContent" />
    <div class="mt-4">
      <app-input-number-buttons-demo />
      <div class="mt-3"><app-code-block [code]="inputNumberButtonsCode" /></div>
    </div>

    <app-prose id="example-clear-icon" class="mt-10 block scroll-mt-24" [content]="clearIconContent" />
    <div class="mt-4">
      <app-input-number-clear-icon-demo />
      <div class="mt-3"><app-code-block [code]="inputNumberClearIconCode" /></div>
    </div>

    <app-prose id="example-float-label" class="mt-10 block scroll-mt-24" [content]="floatLabelContent" />
    <div class="mt-4">
      <app-input-number-float-label-demo />
      <div class="mt-3"><app-code-block [code]="inputNumberFloatLabelCode" /></div>
    </div>

    <app-prose id="example-ifta-label" class="mt-10 block scroll-mt-24" [content]="iftaLabelContent" />
    <div class="mt-4">
      <app-input-number-ifta-label-demo />
      <div class="mt-3"><app-code-block [code]="inputNumberIftaLabelCode" /></div>
    </div>

    <app-prose id="example-sizes" class="mt-10 block scroll-mt-24" [content]="sizesContent" />
    <div class="mt-4">
      <app-input-number-sizes-demo />
      <div class="mt-3"><app-code-block [code]="inputNumberSizesCode" /></div>
    </div>

    <app-prose id="example-fluid" class="mt-10 block scroll-mt-24" [content]="fluidContent" />
    <div class="mt-4">
      <app-input-number-fluid-demo />
      <div class="mt-3"><app-code-block [code]="inputNumberFluidCode" /></div>
    </div>

    <app-prose id="example-filled" class="mt-10 block scroll-mt-24" [content]="filledContent" />
    <div class="mt-4">
      <app-input-number-filled-demo />
      <div class="mt-3"><app-code-block [code]="inputNumberFilledCode" /></div>
    </div>

    <app-prose id="example-disabled" class="mt-10 block scroll-mt-24" [content]="disabledContent" />
    <div class="mt-4">
      <app-input-number-disabled-demo />
      <div class="mt-3"><app-code-block [code]="inputNumberDisabledCode" /></div>
    </div>

    <app-prose id="example-invalid" class="mt-10 block scroll-mt-24" [content]="invalidContent" />
    <div class="mt-4">
      <app-input-number-invalid-demo />
      <div class="mt-3"><app-code-block [code]="inputNumberInvalidCode" /></div>
    </div>

    <app-prose id="example-signal-forms" class="mt-10 block scroll-mt-24" [content]="signalFormsContent" />
    <div class="mt-4">
      <app-input-number-signal-forms-demo />
      <div class="mt-3"><app-code-block [code]="inputNumberSignalFormsCode" /></div>
    </div>

    <app-prose id="example-template-driven" class="mt-10 block scroll-mt-24" [content]="templateDrivenContent" />
    <div class="mt-4">
      <app-input-number-template-driven-demo />
      <div class="mt-3"><app-code-block [code]="inputNumberTemplateDrivenCode" /></div>
    </div>

    <app-prose id="example-reactive-forms" class="mt-10 block scroll-mt-24" [content]="reactiveFormsContent" />
    <div class="mt-4">
      <app-input-number-reactive-forms-demo />
      <div class="mt-3"><app-code-block [code]="inputNumberReactiveFormsCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsInputNumber {
  protected readonly examples = EXAMPLES;
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly basicContent = basicContent;
  protected readonly numeralsContent = numeralsContent;
  protected readonly localeContent = localeContent;
  protected readonly currencyContent = currencyContent;
  protected readonly prefixSuffixContent = prefixSuffixContent;
  protected readonly buttonsContent = buttonsContent;
  protected readonly clearIconContent = clearIconContent;
  protected readonly floatLabelContent = floatLabelContent;
  protected readonly iftaLabelContent = iftaLabelContent;
  protected readonly sizesContent = sizesContent;
  protected readonly fluidContent = fluidContent;
  protected readonly filledContent = filledContent;
  protected readonly disabledContent = disabledContent;
  protected readonly invalidContent = invalidContent;
  protected readonly signalFormsContent = signalFormsContent;
  protected readonly templateDrivenContent = templateDrivenContent;
  protected readonly reactiveFormsContent = reactiveFormsContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly inputNumberBasicCode = inputNumberBasicCode;
  protected readonly inputNumberNumeralsCode = inputNumberNumeralsCode;
  protected readonly inputNumberLocaleCode = inputNumberLocaleCode;
  protected readonly inputNumberCurrencyCode = inputNumberCurrencyCode;
  protected readonly inputNumberPrefixSuffixCode = inputNumberPrefixSuffixCode;
  protected readonly inputNumberButtonsCode = inputNumberButtonsCode;
  protected readonly inputNumberClearIconCode = inputNumberClearIconCode;
  protected readonly inputNumberFloatLabelCode = inputNumberFloatLabelCode;
  protected readonly inputNumberIftaLabelCode = inputNumberIftaLabelCode;
  protected readonly inputNumberSizesCode = inputNumberSizesCode;
  protected readonly inputNumberFluidCode = inputNumberFluidCode;
  protected readonly inputNumberFilledCode = inputNumberFilledCode;
  protected readonly inputNumberDisabledCode = inputNumberDisabledCode;
  protected readonly inputNumberInvalidCode = inputNumberInvalidCode;
  protected readonly inputNumberSignalFormsCode = inputNumberSignalFormsCode;
  protected readonly inputNumberTemplateDrivenCode = inputNumberTemplateDrivenCode;
  protected readonly inputNumberReactiveFormsCode = inputNumberReactiveFormsCode;
}
