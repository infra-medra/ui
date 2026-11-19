import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { MultiSelectBasicDemo } from './demos/multi-select-basic.demo';
import { MultiSelectGroupedDemo } from './demos/multi-select-grouped.demo';
import { MultiSelectChipsDemo } from './demos/multi-select-chips.demo';
import { MultiSelectSelectionLimitDemo } from './demos/multi-select-selection-limit.demo';
import { MultiSelectDataModelDemo } from './demos/multi-select-data-model.demo';
import { MultiSelectTemplateValueDemo } from './demos/multi-select-template-value.demo';
import { MultiSelectTemplateOptionDemo } from './demos/multi-select-template-option.demo';
import { MultiSelectTemplateGroupDemo } from './demos/multi-select-template-group.demo';
import { MultiSelectTemplateChipDemo } from './demos/multi-select-template-chip.demo';
import { MultiSelectTemplateHeaderFooterDemo } from './demos/multi-select-template-header-footer.demo';
import { MultiSelectTemplateEmptyDemo } from './demos/multi-select-template-empty.demo';
import { MultiSelectTemplateIconsDemo } from './demos/multi-select-template-icons.demo';
import { MultiSelectFilterDemo } from './demos/multi-select-filter.demo';
import { MultiSelectLoadingDemo } from './demos/multi-select-loading.demo';
import { MultiSelectSelectAllDemo } from './demos/multi-select-select-all.demo';
import { MultiSelectClearIconDemo } from './demos/multi-select-clear-icon.demo';
import { MultiSelectSizesDemo } from './demos/multi-select-sizes.demo';
import { MultiSelectFluidDemo } from './demos/multi-select-fluid.demo';
import { MultiSelectFilledDemo } from './demos/multi-select-filled.demo';
import { MultiSelectDisabledDemo } from './demos/multi-select-disabled.demo';
import { MultiSelectInvalidDemo } from './demos/multi-select-invalid.demo';
import { MultiSelectEventsDemo } from './demos/multi-select-events.demo';
import { MultiSelectFloatLabelDemo } from './demos/multi-select-float-label.demo';
import { MultiSelectIftaLabelDemo } from './demos/multi-select-ifta-label.demo';
import { MultiSelectSignalFormsDemo } from './demos/multi-select-signal-forms.demo';
import { MultiSelectTemplateDrivenDemo } from './demos/multi-select-template-driven.demo';
import { MultiSelectReactiveFormsDemo } from './demos/multi-select-reactive-forms.demo';

import multiSelectBasicCode from './demos/multi-select-basic.demo.html?raw';
import multiSelectGroupedCode from './demos/multi-select-grouped.demo.html?raw';
import multiSelectChipsCode from './demos/multi-select-chips.demo.html?raw';
import multiSelectSelectionLimitCode from './demos/multi-select-selection-limit.demo.html?raw';
import multiSelectDataModelHtml from './demos/multi-select-data-model.demo.html?raw';
import multiSelectDataModelTs from './demos/multi-select-data-model.demo.ts?raw';
import multiSelectTemplateValueCode from './demos/multi-select-template-value.demo.html?raw';
import multiSelectTemplateOptionCode from './demos/multi-select-template-option.demo.html?raw';
import multiSelectTemplateGroupCode from './demos/multi-select-template-group.demo.html?raw';
import multiSelectTemplateChipCode from './demos/multi-select-template-chip.demo.html?raw';
import multiSelectTemplateHeaderFooterCode from './demos/multi-select-template-header-footer.demo.html?raw';
import multiSelectTemplateEmptyCode from './demos/multi-select-template-empty.demo.html?raw';
import multiSelectTemplateIconsCode from './demos/multi-select-template-icons.demo.html?raw';
import multiSelectFilterCode from './demos/multi-select-filter.demo.html?raw';
import multiSelectLoadingCode from './demos/multi-select-loading.demo.html?raw';
import multiSelectSelectAllCode from './demos/multi-select-select-all.demo.html?raw';
import multiSelectClearIconCode from './demos/multi-select-clear-icon.demo.html?raw';
import multiSelectSizesCode from './demos/multi-select-sizes.demo.html?raw';
import multiSelectFluidCode from './demos/multi-select-fluid.demo.html?raw';
import multiSelectFilledCode from './demos/multi-select-filled.demo.html?raw';
import multiSelectDisabledCode from './demos/multi-select-disabled.demo.html?raw';
import multiSelectInvalidCode from './demos/multi-select-invalid.demo.html?raw';
import multiSelectEventsCode from './demos/multi-select-events.demo.html?raw';
import multiSelectFloatLabelCode from './demos/multi-select-float-label.demo.html?raw';
import multiSelectIftaLabelCode from './demos/multi-select-ifta-label.demo.html?raw';
import multiSelectSignalFormsCode from './demos/multi-select-signal-forms.demo.html?raw';
import multiSelectTemplateDrivenCode from './demos/multi-select-template-driven.demo.html?raw';
import multiSelectReactiveFormsCode from './demos/multi-select-reactive-forms.demo.html?raw';
import apiEntries from '../../../../content/api/multi-select.json';
import introContent from '../../../../content/docs/multi-select-intro.txt?raw';
import basicContent from '../../../../content/docs/multi-select-basic.txt?raw';
import groupedContent from '../../../../content/docs/multi-select-grouped.txt?raw';
import chipsContent from '../../../../content/docs/multi-select-chips.txt?raw';
import selectionLimitContent from '../../../../content/docs/multi-select-selection-limit.txt?raw';
import dataModelContent from '../../../../content/docs/multi-select-data-model.txt?raw';
import templateValueContent from '../../../../content/docs/multi-select-template-value.txt?raw';
import templateOptionContent from '../../../../content/docs/multi-select-template-option.txt?raw';
import templateGroupContent from '../../../../content/docs/multi-select-template-group.txt?raw';
import templateChipContent from '../../../../content/docs/multi-select-template-chip.txt?raw';
import templateHeaderFooterContent from '../../../../content/docs/multi-select-template-header-footer.txt?raw';
import templateEmptyContent from '../../../../content/docs/multi-select-template-empty.txt?raw';
import templateIconsContent from '../../../../content/docs/multi-select-template-icons.txt?raw';
import filterContent from '../../../../content/docs/multi-select-filter.txt?raw';
import loadingContent from '../../../../content/docs/multi-select-loading.txt?raw';
import selectAllContent from '../../../../content/docs/multi-select-select-all.txt?raw';
import clearIconContent from '../../../../content/docs/multi-select-clear-icon.txt?raw';
import sizesContent from '../../../../content/docs/multi-select-sizes.txt?raw';
import fluidContent from '../../../../content/docs/multi-select-fluid.txt?raw';
import filledContent from '../../../../content/docs/multi-select-filled.txt?raw';
import disabledContent from '../../../../content/docs/multi-select-disabled.txt?raw';
import invalidContent from '../../../../content/docs/multi-select-invalid.txt?raw';
import eventsContent from '../../../../content/docs/multi-select-events.txt?raw';
import floatLabelContent from '../../../../content/docs/multi-select-float-label.txt?raw';
import iftaLabelContent from '../../../../content/docs/multi-select-ifta-label.txt?raw';
import signalFormsContent from '../../../../content/docs/multi-select-signal-forms.txt?raw';
import templateDrivenContent from '../../../../content/docs/multi-select-template-driven.txt?raw';
import reactiveFormsContent from '../../../../content/docs/multi-select-reactive-forms.txt?raw';

/** The examples listed in "On this page", in page order; each `id` is the anchor of its block. */
const EXAMPLES = [
  { id: 'example-basic', label: 'Basic' },
  { id: 'example-grouped', label: 'Grouped' },
  { id: 'example-chips', label: 'Chips' },
  { id: 'example-selection-limit', label: 'Selection limit' },
  { id: 'example-data-model', label: 'Data model' },
  { id: 'example-template-value', label: 'Value template' },
  { id: 'example-template-option', label: 'Option template' },
  { id: 'example-template-group', label: 'Group template' },
  { id: 'example-template-chip', label: 'Chip template' },
  { id: 'example-template-header-footer', label: 'Header and footer templates' },
  { id: 'example-template-empty', label: 'Empty template' },
  { id: 'example-template-icons', label: 'Icon templates' },
  { id: 'example-filter', label: 'Filter' },
  { id: 'example-loading', label: 'Loading' },
  { id: 'example-select-all', label: 'Select all' },
  { id: 'example-clear-icon', label: 'Clear icon' },
  { id: 'example-sizes', label: 'Sizes' },
  { id: 'example-fluid', label: 'Fluid' },
  { id: 'example-filled', label: 'Filled' },
  { id: 'example-disabled', label: 'Disabled' },
  { id: 'example-invalid', label: 'Invalid' },
  { id: 'example-events', label: 'Events' },
  { id: 'example-float-label', label: 'Float Label' },
  { id: 'example-ifta-label', label: 'Ifta Label' },
  { id: 'example-signal-forms', label: 'Signal Forms' },
  { id: 'example-template-driven', label: 'Template Driven' },
  { id: 'example-reactive-forms', label: 'Reactive Forms' },
] as const;

const IMPORT_CODE = `import { MultiSelectComponent, type SelectOption } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'MultiSelect — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'MultiSelect component docs: the same combobox and overlay panel as Select, extended to an array value with toggle-without-closing selection, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-multi-select',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, MultiSelectBasicDemo, MultiSelectGroupedDemo, MultiSelectChipsDemo, MultiSelectSelectionLimitDemo, MultiSelectDataModelDemo, MultiSelectTemplateValueDemo, MultiSelectTemplateOptionDemo, MultiSelectTemplateGroupDemo, MultiSelectTemplateChipDemo, MultiSelectTemplateHeaderFooterDemo, MultiSelectTemplateEmptyDemo, MultiSelectTemplateIconsDemo, MultiSelectFilterDemo, MultiSelectLoadingDemo, MultiSelectSelectAllDemo, MultiSelectClearIconDemo, MultiSelectSizesDemo, MultiSelectFluidDemo, MultiSelectFilledDemo, MultiSelectDisabledDemo, MultiSelectInvalidDemo, MultiSelectEventsDemo, MultiSelectFloatLabelDemo, MultiSelectIftaLabelDemo, MultiSelectSignalFormsDemo, MultiSelectTemplateDrivenDemo, MultiSelectReactiveFormsDemo],
  template: `
    <app-component-doc title="MultiSelect" slug="multi-select" [examples]="examples">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />

    <div id="example-basic" class="mt-4 scroll-mt-24">
      <app-prose class="block" [content]="basicContent" />
      <div class="mt-4">
        <app-multi-select-basic-demo />
        <div class="mt-3"><app-code-block [code]="multiSelectBasicCode" /></div>
      </div>
    </div>

    <div id="example-grouped" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="groupedContent" />
      <div class="mt-4">
        <app-multi-select-grouped-demo />
        <div class="mt-3"><app-code-block [code]="multiSelectGroupedCode" /></div>
      </div>
    </div>

    <div id="example-chips" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="chipsContent" />
      <div class="mt-4">
        <app-multi-select-chips-demo />
        <div class="mt-3"><app-code-block [code]="multiSelectChipsCode" /></div>
      </div>
    </div>

    <div id="example-selection-limit" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="selectionLimitContent" />
      <div class="mt-4">
        <app-multi-select-selection-limit-demo />
        <div class="mt-3"><app-code-block [code]="multiSelectSelectionLimitCode" /></div>
      </div>
    </div>

    <div id="example-data-model" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="dataModelContent" />
      <div class="mt-4">
        <app-multi-select-data-model-demo />
        <div class="mt-3"><app-code-block [code]="multiSelectDataModelHtml" /></div>
        <div class="mt-3"><app-code-block [code]="multiSelectDataModelTs" /></div>
      </div>
    </div>

    <div id="example-template-value" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="templateValueContent" />
      <div class="mt-4">
        <app-multi-select-template-value-demo />
        <div class="mt-3"><app-code-block [code]="multiSelectTemplateValueCode" /></div>
      </div>
    </div>

    <div id="example-template-option" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="templateOptionContent" />
      <div class="mt-4">
        <app-multi-select-template-option-demo />
        <div class="mt-3"><app-code-block [code]="multiSelectTemplateOptionCode" /></div>
      </div>
    </div>

    <div id="example-template-group" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="templateGroupContent" />
      <div class="mt-4">
        <app-multi-select-template-group-demo />
        <div class="mt-3"><app-code-block [code]="multiSelectTemplateGroupCode" /></div>
      </div>
    </div>

    <div id="example-template-chip" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="templateChipContent" />
      <div class="mt-4">
        <app-multi-select-template-chip-demo />
        <div class="mt-3"><app-code-block [code]="multiSelectTemplateChipCode" /></div>
      </div>
    </div>

    <div id="example-template-header-footer" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="templateHeaderFooterContent" />
      <div class="mt-4">
        <app-multi-select-template-header-footer-demo />
        <div class="mt-3"><app-code-block [code]="multiSelectTemplateHeaderFooterCode" /></div>
      </div>
    </div>

    <div id="example-template-empty" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="templateEmptyContent" />
      <div class="mt-4">
        <app-multi-select-template-empty-demo />
        <div class="mt-3"><app-code-block [code]="multiSelectTemplateEmptyCode" /></div>
      </div>
    </div>

    <div id="example-template-icons" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="templateIconsContent" />
      <div class="mt-4">
        <app-multi-select-template-icons-demo />
        <div class="mt-3"><app-code-block [code]="multiSelectTemplateIconsCode" /></div>
      </div>
    </div>

    <div id="example-filter" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="filterContent" />
      <div class="mt-4">
        <app-multi-select-filter-demo />
        <div class="mt-3"><app-code-block [code]="multiSelectFilterCode" /></div>
      </div>
    </div>

    <div id="example-loading" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="loadingContent" />
      <div class="mt-4">
        <app-multi-select-loading-demo />
        <div class="mt-3"><app-code-block [code]="multiSelectLoadingCode" /></div>
      </div>
    </div>

    <div id="example-select-all" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="selectAllContent" />
      <div class="mt-4">
        <app-multi-select-select-all-demo />
        <div class="mt-3"><app-code-block [code]="multiSelectSelectAllCode" /></div>
      </div>
    </div>

    <div id="example-clear-icon" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="clearIconContent" />
      <div class="mt-4">
        <app-multi-select-clear-icon-demo />
        <div class="mt-3"><app-code-block [code]="multiSelectClearIconCode" /></div>
      </div>
    </div>

    <div id="example-sizes" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="sizesContent" />
      <div class="mt-4">
        <app-multi-select-sizes-demo />
        <div class="mt-3"><app-code-block [code]="multiSelectSizesCode" /></div>
      </div>
    </div>

    <div id="example-fluid" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="fluidContent" />
      <div class="mt-4">
        <app-multi-select-fluid-demo />
        <div class="mt-3"><app-code-block [code]="multiSelectFluidCode" /></div>
      </div>
    </div>

    <div id="example-filled" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="filledContent" />
      <div class="mt-4">
        <app-multi-select-filled-demo />
        <div class="mt-3"><app-code-block [code]="multiSelectFilledCode" /></div>
      </div>
    </div>

    <div id="example-disabled" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="disabledContent" />
      <div class="mt-4">
        <app-multi-select-disabled-demo />
        <div class="mt-3"><app-code-block [code]="multiSelectDisabledCode" /></div>
      </div>
    </div>

    <div id="example-invalid" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="invalidContent" />
      <div class="mt-4">
        <app-multi-select-invalid-demo />
        <div class="mt-3"><app-code-block [code]="multiSelectInvalidCode" /></div>
      </div>
    </div>

    <div id="example-events" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="eventsContent" />
      <div class="mt-4">
        <app-multi-select-events-demo />
        <div class="mt-3"><app-code-block [code]="multiSelectEventsCode" /></div>
      </div>
    </div>

    <div id="example-float-label" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="floatLabelContent" />
      <div class="mt-4">
        <app-multi-select-float-label-demo />
        <div class="mt-3"><app-code-block [code]="multiSelectFloatLabelCode" /></div>
      </div>
    </div>

    <div id="example-ifta-label" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="iftaLabelContent" />
      <div class="mt-4">
        <app-multi-select-ifta-label-demo />
        <div class="mt-3"><app-code-block [code]="multiSelectIftaLabelCode" /></div>
      </div>
    </div>

    <div id="example-signal-forms" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="signalFormsContent" />
      <div class="mt-4">
        <app-multi-select-signal-forms-demo />
        <div class="mt-3"><app-code-block [code]="multiSelectSignalFormsCode" /></div>
      </div>
    </div>

    <div id="example-template-driven" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="templateDrivenContent" />
      <div class="mt-4">
        <app-multi-select-template-driven-demo />
        <div class="mt-3"><app-code-block [code]="multiSelectTemplateDrivenCode" /></div>
      </div>
    </div>

    <div id="example-reactive-forms" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="reactiveFormsContent" />
      <div class="mt-4">
        <app-multi-select-reactive-forms-demo />
        <div class="mt-3"><app-code-block [code]="multiSelectReactiveFormsCode" /></div>
      </div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsMultiSelect {
  protected readonly examples = EXAMPLES;
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly basicContent = basicContent;
  protected readonly groupedContent = groupedContent;
  protected readonly chipsContent = chipsContent;
  protected readonly selectionLimitContent = selectionLimitContent;
  protected readonly dataModelContent = dataModelContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly multiSelectBasicCode = multiSelectBasicCode;
  protected readonly multiSelectGroupedCode = multiSelectGroupedCode;
  protected readonly multiSelectChipsCode = multiSelectChipsCode;
  protected readonly multiSelectSelectionLimitCode = multiSelectSelectionLimitCode;
  protected readonly multiSelectDataModelHtml = multiSelectDataModelHtml;
  protected readonly multiSelectDataModelTs = multiSelectDataModelTs;
  protected readonly templateValueContent = templateValueContent;
  protected readonly multiSelectTemplateValueCode = multiSelectTemplateValueCode;
  protected readonly templateOptionContent = templateOptionContent;
  protected readonly multiSelectTemplateOptionCode = multiSelectTemplateOptionCode;
  protected readonly templateGroupContent = templateGroupContent;
  protected readonly multiSelectTemplateGroupCode = multiSelectTemplateGroupCode;
  protected readonly templateChipContent = templateChipContent;
  protected readonly multiSelectTemplateChipCode = multiSelectTemplateChipCode;
  protected readonly templateHeaderFooterContent = templateHeaderFooterContent;
  protected readonly multiSelectTemplateHeaderFooterCode = multiSelectTemplateHeaderFooterCode;
  protected readonly templateEmptyContent = templateEmptyContent;
  protected readonly multiSelectTemplateEmptyCode = multiSelectTemplateEmptyCode;
  protected readonly templateIconsContent = templateIconsContent;
  protected readonly multiSelectTemplateIconsCode = multiSelectTemplateIconsCode;
  protected readonly filterContent = filterContent;
  protected readonly multiSelectFilterCode = multiSelectFilterCode;
  protected readonly loadingContent = loadingContent;
  protected readonly multiSelectLoadingCode = multiSelectLoadingCode;
  protected readonly selectAllContent = selectAllContent;
  protected readonly multiSelectSelectAllCode = multiSelectSelectAllCode;
  protected readonly clearIconContent = clearIconContent;
  protected readonly multiSelectClearIconCode = multiSelectClearIconCode;
  protected readonly sizesContent = sizesContent;
  protected readonly multiSelectSizesCode = multiSelectSizesCode;
  protected readonly fluidContent = fluidContent;
  protected readonly multiSelectFluidCode = multiSelectFluidCode;
  protected readonly filledContent = filledContent;
  protected readonly multiSelectFilledCode = multiSelectFilledCode;
  protected readonly disabledContent = disabledContent;
  protected readonly multiSelectDisabledCode = multiSelectDisabledCode;
  protected readonly invalidContent = invalidContent;
  protected readonly multiSelectInvalidCode = multiSelectInvalidCode;
  protected readonly eventsContent = eventsContent;
  protected readonly multiSelectEventsCode = multiSelectEventsCode;
  protected readonly floatLabelContent = floatLabelContent;
  protected readonly multiSelectFloatLabelCode = multiSelectFloatLabelCode;
  protected readonly iftaLabelContent = iftaLabelContent;
  protected readonly multiSelectIftaLabelCode = multiSelectIftaLabelCode;
  protected readonly signalFormsContent = signalFormsContent;
  protected readonly multiSelectSignalFormsCode = multiSelectSignalFormsCode;
  protected readonly templateDrivenContent = templateDrivenContent;
  protected readonly multiSelectTemplateDrivenCode = multiSelectTemplateDrivenCode;
  protected readonly reactiveFormsContent = reactiveFormsContent;
  protected readonly multiSelectReactiveFormsCode = multiSelectReactiveFormsCode;
}
