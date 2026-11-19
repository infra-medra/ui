import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { ListboxBasicDemo } from './demos/listbox-basic.demo';
import { ListboxMultipleDemo } from './demos/listbox-multiple.demo';
import { ListboxMetaKeySelectionDemo } from './demos/listbox-meta-key-selection.demo';
import { ListboxGroupedDemo } from './demos/listbox-grouped.demo';
import { ListboxFilterDemo } from './demos/listbox-filter.demo';
import { ListboxTemplateOptionDemo } from './demos/listbox-template-option.demo';
import { ListboxTemplateGroupDemo } from './demos/listbox-template-group.demo';
import { ListboxTemplateHeaderFooterDemo } from './demos/listbox-template-header-footer.demo';
import { ListboxTemplateEmptyDemo } from './demos/listbox-template-empty.demo';
import { ListboxLoadingDemo } from './demos/listbox-loading.demo';
import { ListboxSelectAllDemo } from './demos/listbox-select-all.demo';
import { ListboxCheckmarkDemo } from './demos/listbox-checkmark.demo';
import { ListboxStripedDemo } from './demos/listbox-striped.demo';
import { ListboxDisabledDemo } from './demos/listbox-disabled.demo';
import { ListboxInvalidDemo } from './demos/listbox-invalid.demo';
import { ListboxReadonlyDemo } from './demos/listbox-readonly.demo';
import { ListboxEventsDemo } from './demos/listbox-events.demo';
import { ListboxDataModelDemo } from './demos/listbox-data-model.demo';
import { ListboxSignalFormsDemo } from './demos/listbox-signal-forms.demo';
import { ListboxTemplateDrivenDemo } from './demos/listbox-template-driven.demo';
import { ListboxReactiveFormsDemo } from './demos/listbox-reactive-forms.demo';
import { ListboxDragdropDemo } from './demos/listbox-dragdrop.demo';

import listboxBasicCode from './demos/listbox-basic.demo.html?raw';
import listboxMultipleCode from './demos/listbox-multiple.demo.html?raw';
import listboxMetaKeySelectionCode from './demos/listbox-meta-key-selection.demo.html?raw';
import listboxGroupedCode from './demos/listbox-grouped.demo.html?raw';
import listboxFilterCode from './demos/listbox-filter.demo.html?raw';
import listboxTemplateOptionCode from './demos/listbox-template-option.demo.html?raw';
import listboxTemplateGroupCode from './demos/listbox-template-group.demo.html?raw';
import listboxTemplateHeaderFooterCode from './demos/listbox-template-header-footer.demo.html?raw';
import listboxTemplateEmptyCode from './demos/listbox-template-empty.demo.html?raw';
import listboxLoadingCode from './demos/listbox-loading.demo.html?raw';
import listboxSelectAllCode from './demos/listbox-select-all.demo.html?raw';
import listboxCheckmarkCode from './demos/listbox-checkmark.demo.html?raw';
import listboxStripedCode from './demos/listbox-striped.demo.html?raw';
import listboxDisabledCode from './demos/listbox-disabled.demo.html?raw';
import listboxInvalidCode from './demos/listbox-invalid.demo.html?raw';
import listboxReadonlyCode from './demos/listbox-readonly.demo.html?raw';
import listboxEventsCode from './demos/listbox-events.demo.html?raw';
import listboxDataModelHtml from './demos/listbox-data-model.demo.html?raw';
import listboxDataModelTs from './demos/listbox-data-model.demo.ts?raw';
import listboxSignalFormsCode from './demos/listbox-signal-forms.demo.html?raw';
import listboxTemplateDrivenCode from './demos/listbox-template-driven.demo.html?raw';
import listboxReactiveFormsCode from './demos/listbox-reactive-forms.demo.html?raw';
import listboxDragdropCode from './demos/listbox-dragdrop.demo.html?raw';
import apiEntries from '../../../../content/api/listbox.json';
import introContent from '../../../../content/docs/listbox-intro.txt?raw';
import basicContent from '../../../../content/docs/listbox-basic.txt?raw';
import multipleContent from '../../../../content/docs/listbox-multiple.txt?raw';
import metaKeySelectionContent from '../../../../content/docs/listbox-meta-key-selection.txt?raw';
import groupedContent from '../../../../content/docs/listbox-grouped.txt?raw';
import filterContent from '../../../../content/docs/listbox-filter.txt?raw';
import templateOptionContent from '../../../../content/docs/listbox-template-option.txt?raw';
import templateGroupContent from '../../../../content/docs/listbox-template-group.txt?raw';
import templateHeaderFooterContent from '../../../../content/docs/listbox-template-header-footer.txt?raw';
import templateEmptyContent from '../../../../content/docs/listbox-template-empty.txt?raw';
import loadingContent from '../../../../content/docs/listbox-loading.txt?raw';
import selectAllContent from '../../../../content/docs/listbox-select-all.txt?raw';
import checkmarkContent from '../../../../content/docs/listbox-checkmark.txt?raw';
import stripedContent from '../../../../content/docs/listbox-striped.txt?raw';
import disabledContent from '../../../../content/docs/listbox-disabled.txt?raw';
import invalidContent from '../../../../content/docs/listbox-invalid.txt?raw';
import readonlyContent from '../../../../content/docs/listbox-readonly.txt?raw';
import eventsContent from '../../../../content/docs/listbox-events.txt?raw';
import dataModelContent from '../../../../content/docs/listbox-data-model.txt?raw';
import signalFormsContent from '../../../../content/docs/listbox-signal-forms.txt?raw';
import templateDrivenContent from '../../../../content/docs/listbox-template-driven.txt?raw';
import reactiveFormsContent from '../../../../content/docs/listbox-reactive-forms.txt?raw';
import dragdropContent from '../../../../content/docs/listbox-dragdrop.txt?raw';

/** The examples listed in "On this page", in page order; each `id` is the anchor of its block. */
const EXAMPLES = [
  { id: 'example-basic', label: 'Basic' },
  { id: 'example-multiple', label: 'Multiple' },
  { id: 'example-meta-key-selection', label: 'Meta key selection' },
  { id: 'example-grouped', label: 'Grouped options' },
  { id: 'example-filter', label: 'Filter' },
  { id: 'example-template-option', label: 'Option template' },
  { id: 'example-template-group', label: 'Group template' },
  { id: 'example-template-header-footer', label: 'Header and footer templates' },
  { id: 'example-template-empty', label: 'Empty template' },
  { id: 'example-loading', label: 'Loading' },
  { id: 'example-select-all', label: 'Select all' },
  { id: 'example-checkmark', label: 'Checkmark' },
  { id: 'example-striped', label: 'Striped' },
  { id: 'example-disabled', label: 'Disabled' },
  { id: 'example-invalid', label: 'Invalid' },
  { id: 'example-readonly', label: 'Read only' },
  { id: 'example-events', label: 'Events' },
  { id: 'example-data-model', label: 'Data model' },
  { id: 'example-dragdrop', label: 'Drag and drop' },
  { id: 'example-signal-forms', label: 'Signal Forms' },
  { id: 'example-template-driven', label: 'Template Driven' },
  { id: 'example-reactive-forms', label: 'Reactive Forms' },
] as const;

const IMPORT_CODE = `import { ListboxComponent, type SelectOption } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'Listbox — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Listbox component docs: the same option-list panel used by Select and MultiSelect, rendered always-visible inline instead of behind an overlay, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-listbox',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, ListboxBasicDemo, ListboxMultipleDemo, ListboxMetaKeySelectionDemo, ListboxGroupedDemo, ListboxFilterDemo, ListboxTemplateOptionDemo, ListboxTemplateGroupDemo, ListboxTemplateHeaderFooterDemo, ListboxTemplateEmptyDemo, ListboxLoadingDemo, ListboxSelectAllDemo, ListboxCheckmarkDemo, ListboxStripedDemo, ListboxDisabledDemo, ListboxInvalidDemo, ListboxReadonlyDemo, ListboxEventsDemo, ListboxDataModelDemo, ListboxDragdropDemo, ListboxSignalFormsDemo, ListboxTemplateDrivenDemo, ListboxReactiveFormsDemo],
  template: `
    <app-component-doc title="Listbox" slug="listbox" [examples]="examples">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div id="example-basic" class="mt-4 scroll-mt-24">
      <app-prose class="block" [content]="basicContent" />
      <div class="mt-4">
        <app-listbox-basic-demo />
        <div class="mt-3"><app-code-block [code]="listboxBasicCode" /></div>
      </div>
    </div>

    <div id="example-multiple" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="multipleContent" />
      <div class="mt-4">
        <app-listbox-multiple-demo />
        <div class="mt-3"><app-code-block [code]="listboxMultipleCode" /></div>
      </div>
    </div>

    <div id="example-meta-key-selection" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="metaKeySelectionContent" />
      <div class="mt-4">
        <app-listbox-meta-key-selection-demo />
        <div class="mt-3"><app-code-block [code]="listboxMetaKeySelectionCode" /></div>
      </div>
    </div>

    <div id="example-grouped" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="groupedContent" />
      <div class="mt-4">
        <app-listbox-grouped-demo />
        <div class="mt-3"><app-code-block [code]="listboxGroupedCode" /></div>
      </div>
    </div>

    <div id="example-filter" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="filterContent" />
      <div class="mt-4">
        <app-listbox-filter-demo />
        <div class="mt-3"><app-code-block [code]="listboxFilterCode" /></div>
      </div>
    </div>

    <div id="example-template-option" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="templateOptionContent" />
      <div class="mt-4">
        <app-listbox-template-option-demo />
        <div class="mt-3"><app-code-block [code]="listboxTemplateOptionCode" /></div>
      </div>
    </div>

    <div id="example-template-group" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="templateGroupContent" />
      <div class="mt-4">
        <app-listbox-template-group-demo />
        <div class="mt-3"><app-code-block [code]="listboxTemplateGroupCode" /></div>
      </div>
    </div>

    <div id="example-template-header-footer" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="templateHeaderFooterContent" />
      <div class="mt-4">
        <app-listbox-template-header-footer-demo />
        <div class="mt-3"><app-code-block [code]="listboxTemplateHeaderFooterCode" /></div>
      </div>
    </div>

    <div id="example-template-empty" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="templateEmptyContent" />
      <div class="mt-4">
        <app-listbox-template-empty-demo />
        <div class="mt-3"><app-code-block [code]="listboxTemplateEmptyCode" /></div>
      </div>
    </div>

    <div id="example-loading" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="loadingContent" />
      <div class="mt-4">
        <app-listbox-loading-demo />
        <div class="mt-3"><app-code-block [code]="listboxLoadingCode" /></div>
      </div>
    </div>

    <div id="example-select-all" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="selectAllContent" />
      <div class="mt-4">
        <app-listbox-select-all-demo />
        <div class="mt-3"><app-code-block [code]="listboxSelectAllCode" /></div>
      </div>
    </div>

    <div id="example-checkmark" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="checkmarkContent" />
      <div class="mt-4">
        <app-listbox-checkmark-demo />
        <div class="mt-3"><app-code-block [code]="listboxCheckmarkCode" /></div>
      </div>
    </div>

    <div id="example-striped" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="stripedContent" />
      <div class="mt-4">
        <app-listbox-striped-demo />
        <div class="mt-3"><app-code-block [code]="listboxStripedCode" /></div>
      </div>
    </div>

    <div id="example-disabled" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="disabledContent" />
      <div class="mt-4">
        <app-listbox-disabled-demo />
        <div class="mt-3"><app-code-block [code]="listboxDisabledCode" /></div>
      </div>
    </div>

    <div id="example-invalid" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="invalidContent" />
      <div class="mt-4">
        <app-listbox-invalid-demo />
        <div class="mt-3"><app-code-block [code]="listboxInvalidCode" /></div>
      </div>
    </div>

    <div id="example-readonly" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="readonlyContent" />
      <div class="mt-4">
        <app-listbox-readonly-demo />
        <div class="mt-3"><app-code-block [code]="listboxReadonlyCode" /></div>
      </div>
    </div>

    <div id="example-events" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="eventsContent" />
      <div class="mt-4">
        <app-listbox-events-demo />
        <div class="mt-3"><app-code-block [code]="listboxEventsCode" /></div>
      </div>
    </div>

    <div id="example-data-model" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="dataModelContent" />
      <div class="mt-4">
        <app-listbox-data-model-demo />
        <div class="mt-3"><app-code-block [code]="listboxDataModelHtml" /></div>
        <div class="mt-3"><app-code-block [code]="listboxDataModelTs" /></div>
      </div>
    </div>

    <div id="example-dragdrop" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="dragdropContent" />
      <div class="mt-4">
        <app-listbox-dragdrop-demo />
        <div class="mt-3"><app-code-block [code]="listboxDragdropCode" /></div>
      </div>
    </div>

    <div id="example-signal-forms" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="signalFormsContent" />
      <div class="mt-4">
        <app-listbox-signal-forms-demo />
        <div class="mt-3"><app-code-block [code]="listboxSignalFormsCode" /></div>
      </div>
    </div>

    <div id="example-template-driven" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="templateDrivenContent" />
      <div class="mt-4">
        <app-listbox-template-driven-demo />
        <div class="mt-3"><app-code-block [code]="listboxTemplateDrivenCode" /></div>
      </div>
    </div>

    <div id="example-reactive-forms" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="reactiveFormsContent" />
      <div class="mt-4">
        <app-listbox-reactive-forms-demo />
        <div class="mt-3"><app-code-block [code]="listboxReactiveFormsCode" /></div>
      </div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsListbox {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly examples = EXAMPLES;
  protected readonly basicContent = basicContent;
  protected readonly multipleContent = multipleContent;
  protected readonly metaKeySelectionContent = metaKeySelectionContent;
  protected readonly dataModelContent = dataModelContent;
  protected readonly loadingContent = loadingContent;
  protected readonly selectAllContent = selectAllContent;
  protected readonly checkmarkContent = checkmarkContent;
  protected readonly stripedContent = stripedContent;
  protected readonly disabledContent = disabledContent;
  protected readonly invalidContent = invalidContent;
  protected readonly readonlyContent = readonlyContent;
  protected readonly eventsContent = eventsContent;
  protected readonly groupedContent = groupedContent;
  protected readonly filterContent = filterContent;
  protected readonly templateOptionContent = templateOptionContent;
  protected readonly templateGroupContent = templateGroupContent;
  protected readonly templateHeaderFooterContent = templateHeaderFooterContent;
  protected readonly templateEmptyContent = templateEmptyContent;
  protected readonly dragdropContent = dragdropContent;
  protected readonly signalFormsContent = signalFormsContent;
  protected readonly templateDrivenContent = templateDrivenContent;
  protected readonly reactiveFormsContent = reactiveFormsContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly listboxBasicCode = listboxBasicCode;
  protected readonly listboxMultipleCode = listboxMultipleCode;
  protected readonly listboxMetaKeySelectionCode = listboxMetaKeySelectionCode;
  protected readonly listboxGroupedCode = listboxGroupedCode;
  protected readonly listboxFilterCode = listboxFilterCode;
  protected readonly listboxTemplateOptionCode = listboxTemplateOptionCode;
  protected readonly listboxTemplateGroupCode = listboxTemplateGroupCode;
  protected readonly listboxTemplateHeaderFooterCode = listboxTemplateHeaderFooterCode;
  protected readonly listboxTemplateEmptyCode = listboxTemplateEmptyCode;
  protected readonly listboxLoadingCode = listboxLoadingCode;
  protected readonly listboxSelectAllCode = listboxSelectAllCode;
  protected readonly listboxCheckmarkCode = listboxCheckmarkCode;
  protected readonly listboxStripedCode = listboxStripedCode;
  protected readonly listboxDisabledCode = listboxDisabledCode;
  protected readonly listboxInvalidCode = listboxInvalidCode;
  protected readonly listboxReadonlyCode = listboxReadonlyCode;
  protected readonly listboxEventsCode = listboxEventsCode;
  protected readonly listboxDataModelHtml = listboxDataModelHtml;
  protected readonly listboxDataModelTs = listboxDataModelTs;
  protected readonly listboxDragdropCode = listboxDragdropCode;
  protected readonly listboxSignalFormsCode = listboxSignalFormsCode;
  protected readonly listboxTemplateDrivenCode = listboxTemplateDrivenCode;
  protected readonly listboxReactiveFormsCode = listboxReactiveFormsCode;
}
