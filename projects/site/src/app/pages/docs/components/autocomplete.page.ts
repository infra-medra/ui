import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { AutocompleteBasicDemo } from './demos/autocomplete-basic.demo';
import { AutocompleteMultipleDemo } from './demos/autocomplete-multiple.demo';
import { AutocompleteGroupedDropdownDemo } from './demos/autocomplete-grouped-dropdown.demo';
import { AutocompleteForceSelectionDemo } from './demos/autocomplete-force-selection.demo';
import { AutocompleteCompleteOnFocusDemo } from './demos/autocomplete-complete-on-focus.demo';
import { AutocompleteEventsDemo } from './demos/autocomplete-events.demo';
import { AutocompleteAutoHighlightDemo } from './demos/autocomplete-auto-highlight.demo';
import { AutocompleteUniqueDemo } from './demos/autocomplete-unique.demo';
import { AutocompleteReadonlyDemo } from './demos/autocomplete-readonly.demo';
import { AutocompleteItemTemplateDemo } from './demos/autocomplete-item-template.demo';
import { AutocompleteGroupTemplateDemo } from './demos/autocomplete-group-template.demo';
import { AutocompleteEmptyTemplateDemo } from './demos/autocomplete-empty-template.demo';
import { AutocompleteLoaderTemplateDemo } from './demos/autocomplete-loader-template.demo';
import { AutocompleteStatesDemo } from './demos/autocomplete-states.demo';
import { AutocompleteSizesDemo } from './demos/autocomplete-sizes.demo';
import { AutocompleteScrollHeightDemo } from './demos/autocomplete-scroll-height.demo';
import { AutocompleteVirtualScrollDemo } from './demos/autocomplete-virtual-scroll.demo';

import autocompleteBasicCode from './demos/autocomplete-basic.demo.html?raw';
import autocompleteMultipleCode from './demos/autocomplete-multiple.demo.html?raw';
import autocompleteGroupedDropdownCode from './demos/autocomplete-grouped-dropdown.demo.html?raw';
import autocompleteForceSelectionCode from './demos/autocomplete-force-selection.demo.html?raw';
import autocompleteCompleteOnFocusCode from './demos/autocomplete-complete-on-focus.demo.html?raw';
import autocompleteEventsCode from './demos/autocomplete-events.demo.html?raw';
import autocompleteAutoHighlightCode from './demos/autocomplete-auto-highlight.demo.html?raw';
import autocompleteUniqueCode from './demos/autocomplete-unique.demo.html?raw';
import autocompleteReadonlyCode from './demos/autocomplete-readonly.demo.html?raw';
import autocompleteItemTemplateCode from './demos/autocomplete-item-template.demo.html?raw';
import autocompleteGroupTemplateCode from './demos/autocomplete-group-template.demo.html?raw';
import autocompleteEmptyTemplateCode from './demos/autocomplete-empty-template.demo.html?raw';
import autocompleteLoaderTemplateCode from './demos/autocomplete-loader-template.demo.html?raw';
import autocompleteStatesCode from './demos/autocomplete-states.demo.html?raw';
import autocompleteSizesCode from './demos/autocomplete-sizes.demo.html?raw';
import autocompleteScrollHeightCode from './demos/autocomplete-scroll-height.demo.html?raw';
import autocompleteVirtualScrollCode from './demos/autocomplete-virtual-scroll.demo.html?raw';
import apiEntries from '../../../../content/api/autocomplete.json';
import introContent from '../../../../content/docs/autocomplete-intro.txt?raw';
import multipleContent from '../../../../content/docs/autocomplete-multiple.txt?raw';
import groupedDropdownContent from '../../../../content/docs/autocomplete-grouped-dropdown.txt?raw';
import forceSelectionContent from '../../../../content/docs/autocomplete-force-selection.txt?raw';
import completeOnFocusContent from '../../../../content/docs/autocomplete-complete-on-focus.txt?raw';
import eventsContent from '../../../../content/docs/autocomplete-events.txt?raw';
import autoHighlightContent from '../../../../content/docs/autocomplete-auto-highlight.txt?raw';
import uniqueContent from '../../../../content/docs/autocomplete-unique.txt?raw';
import readonlyExContent from '../../../../content/docs/autocomplete-readonly.txt?raw';
import itemTemplateContent from '../../../../content/docs/autocomplete-item-template.txt?raw';
import groupTemplateContent from '../../../../content/docs/autocomplete-group-template.txt?raw';
import emptyTemplateContent from '../../../../content/docs/autocomplete-empty-template.txt?raw';
import loaderTemplateContent from '../../../../content/docs/autocomplete-loader-template.txt?raw';
import statesContent from '../../../../content/docs/autocomplete-states.txt?raw';
import sizesContent from '../../../../content/docs/autocomplete-sizes.txt?raw';
import scrollHeightContent from '../../../../content/docs/autocomplete-scroll-height.txt?raw';
import virtualScrollContent from '../../../../content/docs/autocomplete-virtual-scroll.txt?raw';

const EXAMPLES = [
  { id: 'example-basic', label: 'Basic' },
  { id: 'example-multiple', label: 'Multiple' },
  { id: 'example-grouped-dropdown', label: 'Grouped with dropdown' },
  { id: 'example-force-selection', label: 'Force selection' },
  { id: 'example-complete-on-focus', label: 'Complete on focus' },
  { id: 'example-events', label: 'Events' },
  { id: 'example-auto-highlight', label: 'Auto highlight' },
  { id: 'example-unique', label: 'Unique' },
  { id: 'example-readonly', label: 'Read-only' },
  { id: 'example-item-template', label: 'Item template' },
  { id: 'example-group-template', label: 'Group template' },
  { id: 'example-empty-template', label: 'Empty template' },
  { id: 'example-loader-template', label: 'Loader template' },
  { id: 'example-states', label: 'States' },
  { id: 'example-sizes', label: 'Sizes' },
  { id: 'example-scroll-height', label: 'Scroll height' },
  { id: 'example-virtual-scroll', label: 'Virtual scroll' },
] as const;

const IMPORT_CODE = `import { AutocompleteComponent, type SelectOption } from '@medra/ui';`;

export const routeMeta: RouteMeta = {
  title: 'AutoComplete — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'AutoComplete component docs: an editable combobox that emits a debounced (search) event and lets the consumer supply suggestions, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-autocomplete',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, AutocompleteBasicDemo, AutocompleteMultipleDemo, AutocompleteGroupedDropdownDemo, AutocompleteForceSelectionDemo, AutocompleteCompleteOnFocusDemo, AutocompleteEventsDemo, AutocompleteAutoHighlightDemo, AutocompleteUniqueDemo, AutocompleteReadonlyDemo, AutocompleteItemTemplateDemo, AutocompleteGroupTemplateDemo, AutocompleteEmptyTemplateDemo, AutocompleteLoaderTemplateDemo, AutocompleteStatesDemo, AutocompleteSizesDemo, AutocompleteScrollHeightDemo, AutocompleteVirtualScrollDemo],
  template: `
    <app-component-doc title="AutoComplete" slug="autocomplete" [examples]="examples">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div id="example-basic" class="mt-4 scroll-mt-24">
      <app-autocomplete-basic-demo />
      <div class="mt-3"><app-code-block [code]="autocompleteBasicCode" /></div>
    </div>

    <app-prose id="example-multiple" class="mt-10 block scroll-mt-24" [content]="multipleContent" />
    <div class="mt-4">
      <app-autocomplete-multiple-demo />
      <div class="mt-3"><app-code-block [code]="autocompleteMultipleCode" /></div>
    </div>

    <app-prose id="example-grouped-dropdown" class="mt-10 block scroll-mt-24" [content]="groupedDropdownContent" />
    <div class="mt-4">
      <app-autocomplete-grouped-dropdown-demo />
      <div class="mt-3"><app-code-block [code]="autocompleteGroupedDropdownCode" /></div>
    </div>

    <app-prose id="example-force-selection" class="mt-10 block scroll-mt-24" [content]="forceSelectionContent" />
    <div class="mt-4">
      <app-autocomplete-force-selection-demo />
      <div class="mt-3"><app-code-block [code]="autocompleteForceSelectionCode" /></div>
    </div>

    <app-prose id="example-complete-on-focus" class="mt-10 block scroll-mt-24" [content]="completeOnFocusContent" />
    <div class="mt-4">
      <app-autocomplete-complete-on-focus-demo />
      <div class="mt-3"><app-code-block [code]="autocompleteCompleteOnFocusCode" /></div>
    </div>

    <app-prose id="example-events" class="mt-10 block scroll-mt-24" [content]="eventsContent" />
    <div class="mt-4">
      <app-autocomplete-events-demo />
      <div class="mt-3"><app-code-block [code]="autocompleteEventsCode" /></div>
    </div>

    <app-prose id="example-auto-highlight" class="mt-10 block scroll-mt-24" [content]="autoHighlightContent" />
    <div class="mt-4">
      <app-autocomplete-auto-highlight-demo />
      <div class="mt-3"><app-code-block [code]="autocompleteAutoHighlightCode" /></div>
    </div>

    <app-prose id="example-unique" class="mt-10 block scroll-mt-24" [content]="uniqueContent" />
    <div class="mt-4">
      <app-autocomplete-unique-demo />
      <div class="mt-3"><app-code-block [code]="autocompleteUniqueCode" /></div>
    </div>

    <app-prose id="example-readonly" class="mt-10 block scroll-mt-24" [content]="readonlyExContent" />
    <div class="mt-4">
      <app-autocomplete-readonly-demo />
      <div class="mt-3"><app-code-block [code]="autocompleteReadonlyCode" /></div>
    </div>

    <app-prose id="example-item-template" class="mt-10 block scroll-mt-24" [content]="itemTemplateContent" />
    <div class="mt-4">
      <app-autocomplete-item-template-demo />
      <div class="mt-3"><app-code-block [code]="autocompleteItemTemplateCode" /></div>
    </div>

    <app-prose id="example-group-template" class="mt-10 block scroll-mt-24" [content]="groupTemplateContent" />
    <div class="mt-4">
      <app-autocomplete-group-template-demo />
      <div class="mt-3"><app-code-block [code]="autocompleteGroupTemplateCode" /></div>
    </div>

    <app-prose id="example-empty-template" class="mt-10 block scroll-mt-24" [content]="emptyTemplateContent" />
    <div class="mt-4">
      <app-autocomplete-empty-template-demo />
      <div class="mt-3"><app-code-block [code]="autocompleteEmptyTemplateCode" /></div>
    </div>

    <app-prose id="example-loader-template" class="mt-10 block scroll-mt-24" [content]="loaderTemplateContent" />
    <div class="mt-4">
      <app-autocomplete-loader-template-demo />
      <div class="mt-3"><app-code-block [code]="autocompleteLoaderTemplateCode" /></div>
    </div>

    <app-prose id="example-states" class="mt-10 block scroll-mt-24" [content]="statesContent" />
    <div class="mt-4">
      <app-autocomplete-states-demo />
      <div class="mt-3"><app-code-block [code]="autocompleteStatesCode" /></div>
    </div>

    <app-prose id="example-sizes" class="mt-10 block scroll-mt-24" [content]="sizesContent" />
    <div class="mt-4">
      <app-autocomplete-sizes-demo />
      <div class="mt-3"><app-code-block [code]="autocompleteSizesCode" /></div>
    </div>

    <app-prose id="example-scroll-height" class="mt-10 block scroll-mt-24" [content]="scrollHeightContent" />
    <div class="mt-4">
      <app-autocomplete-scroll-height-demo />
      <div class="mt-3"><app-code-block [code]="autocompleteScrollHeightCode" /></div>
    </div>

    <app-prose id="example-virtual-scroll" class="mt-10 block scroll-mt-24" [content]="virtualScrollContent" />
    <div class="mt-4">
      <app-autocomplete-virtual-scroll-demo />
      <div class="mt-3"><app-code-block [code]="autocompleteVirtualScrollCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsAutocomplete {
  protected readonly examples = EXAMPLES;
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly multipleContent = multipleContent;
  protected readonly groupedDropdownContent = groupedDropdownContent;
  protected readonly forceSelectionContent = forceSelectionContent;
  protected readonly autocompleteForceSelectionCode = autocompleteForceSelectionCode;
  protected readonly completeOnFocusContent = completeOnFocusContent;
  protected readonly autocompleteCompleteOnFocusCode = autocompleteCompleteOnFocusCode;
  protected readonly eventsContent = eventsContent;
  protected readonly autocompleteEventsCode = autocompleteEventsCode;
  protected readonly autoHighlightContent = autoHighlightContent;
  protected readonly autocompleteAutoHighlightCode = autocompleteAutoHighlightCode;
  protected readonly uniqueContent = uniqueContent;
  protected readonly autocompleteUniqueCode = autocompleteUniqueCode;
  protected readonly readonlyExContent = readonlyExContent;
  protected readonly autocompleteReadonlyCode = autocompleteReadonlyCode;
  protected readonly itemTemplateContent = itemTemplateContent;
  protected readonly autocompleteItemTemplateCode = autocompleteItemTemplateCode;
  protected readonly groupTemplateContent = groupTemplateContent;
  protected readonly autocompleteGroupTemplateCode = autocompleteGroupTemplateCode;
  protected readonly emptyTemplateContent = emptyTemplateContent;
  protected readonly autocompleteEmptyTemplateCode = autocompleteEmptyTemplateCode;
  protected readonly loaderTemplateContent = loaderTemplateContent;
  protected readonly autocompleteLoaderTemplateCode = autocompleteLoaderTemplateCode;
  protected readonly statesContent = statesContent;
  protected readonly autocompleteStatesCode = autocompleteStatesCode;
  protected readonly sizesContent = sizesContent;
  protected readonly autocompleteSizesCode = autocompleteSizesCode;
  protected readonly scrollHeightContent = scrollHeightContent;
  protected readonly autocompleteScrollHeightCode = autocompleteScrollHeightCode;
  protected readonly virtualScrollContent = virtualScrollContent;
  protected readonly autocompleteVirtualScrollCode = autocompleteVirtualScrollCode;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly autocompleteBasicCode = autocompleteBasicCode;
  protected readonly autocompleteMultipleCode = autocompleteMultipleCode;
  protected readonly autocompleteGroupedDropdownCode = autocompleteGroupedDropdownCode;
}
