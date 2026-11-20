# @medra.dev/ui

## 21.0.1

### Patch Changes

- 9c0df3f: Replace the placeholder package README with installation, usage and versioning notes.

## 21.0.0

### Minor Changes

- `med-autocomplete`: add additional inputs and outputs. New inputs cover `forceSelection`, `completeOnFocus`, `autoHighlight`, `unique`, `readonly`, `scrollHeight` and optional virtual scrolling (`virtualScroll`, `virtualScrollItemSize`, `lazy`). New outputs cover selection, removal, focus, blur, clear, panel show and hide, dropdown click and lazy loading. Four named templates (`#item`, `#group`, `#empty` and `#loader`) customize the panel. All changes are additive.

- `med-cascade-select`: add additional inputs, outputs and templates. New inputs map consumer data (`optionLabel`, `optionValue`, `optionGroupLabel`, `optionGroupChildren`, `optionDisabled`, `dataKey`), show a `loading` state, and set field attributes and appearance (`name`, `inputId`, `tabindex`, `ariaLabel`, `ariaLabelledBy`, `autofocus`, `required`, `variant`, `fluid`, `panelStyleClass`, `appendTo`). New outputs cover selection, group opening, panel show and hide (with their before events), clear, focus and blur. Eight named templates (`#value`, `#option`, `#header`, `#footer`, `#groupIcon`, `#triggerIcon`, `#loadingIcon` and `#clearIcon`) customize the field and the panel. `selectTriggerVariants` gains a `variant` option. All changes are additive.

- `med-listbox`: add additional inputs, outputs and templates. New inputs map consumer data (`optionLabel`, `optionValue`, `optionDisabled`, `optionGroupLabel`, `optionGroupChildren`, `dataKey`), filter on other fields (`filterBy`, `filterMatchMode`), select without Ctrl or Cmd (`metaKeySelection`), block changes (`readonly`), and set list attributes and appearance (`name`, `tabindex`, `ariaLabel`, `ariaLabelledBy`, `scrollHeight`, `listStyleClass`). New outputs cover selection changes, option click and double click, "Select all", focus, blur and filter text. Six named templates (`#option`, `#group`, `#header`, `#footer`, `#empty` and `#loadingIcon`) customize the list. Behavior change: with `filter` on, "Select all" now acts only on the options the filter currently shows, not the whole list. Everything else is additive.

- Menu family (`med-menu`, `med-menubar`, `med-mega-menu`, `med-panel-menu`, `med-tiered-menu`, `med-tab-menu`): `MenuItem` gains three optional fields.

  - `visible`: `false` omits the item, and its children, from the screen and from keyboard navigation. A group of `med-menu` with no visible item disappears with its label. It is a UI hint, not authorization.
  - `routerLink`: renders the item as a real `<a href>` that navigates through the Router on a plain click and leaves Ctrl/Cmd/Shift/Alt and middle clicks to the browser. It wins over `url`, still calls `command`, and a disabled item renders no `href`.
  - `routerLinkActiveOptions`: `{ exact: true }` limits the active state to an exact URL match. An item with `routerLink` is marked with `aria-current="page"` and the active style while its route is active.

  `routerLink` needs the new optional entry point `@medra.dev/ui/router`: register `provideMedraMenuRouterLinks()` after `provideRouter(...)`. Rendering an item with `routerLink` without it throws an error that says so. The main entry point still does not import `@angular/router`, which is now an optional peer dependency (`^21.2.25`). Apps that never set `routerLink` need no change.

- `med-multi-select`: add additional inputs, outputs and templates. New inputs map consumer data (`optionLabel`, `optionValue`, `optionDisabled`, `optionGroupLabel`, `optionGroupChildren`, `dataKey`), tune the panel filter (`filterBy`, `filterMatchMode`, `resetFilterOnHide`, `autofocusFilter`), and set field attributes and appearance (`name`, `tabindex`, `ariaLabel`, `ariaLabelledBy`, `autofocus`, `required`, `variant`, `fluid`, `panelStyleClass`, `appendTo`, `scrollHeight`). `name` renders one hidden input per chosen value. New outputs cover selection, chip removal, select all, clear, field click, focus, blur, filter, and panel show and hide (with their before events). Eleven named templates (`#value`, `#chip`, `#option`, `#group`, `#header`, `#footer`, `#empty`, `#triggerIcon`, `#clearIcon`, `#loadingIcon` and `#chipRemoveIcon`) customize the field and the panel. `selectTriggerVariants` is reused with its `variant` option.

  One default behavior changes: the text typed in the panel filter is now kept when the panel closes and reopens. Set `resetFilterOnHide` to clear it on every close, as before. All other changes are additive.

- `med-select`: add additional inputs, outputs and templates. New inputs map consumer data (`optionLabel`, `optionValue`, `optionDisabled`, `optionGroupLabel`, `optionGroupChildren`, `dataKey`), tune the filter (`filterBy`, `filterMatchMode`, `resetFilterOnHide`, `autofocusFilter`), and set field attributes and appearance (`name`, `tabindex`, `ariaLabel`, `ariaLabelledBy`, `required`, `autofocus`, `variant`, `fluid`, `panelStyleClass`, `appendTo`, `scrollHeight`). New outputs cover selection, panel show and hide (with their before events), field click, clear, filter, focus and blur. Nine named templates (`#value`, `#option`, `#group`, `#header`, `#footer`, `#empty`, `#triggerIcon`, `#loadingIcon` and `#clearIcon`) customize the field and the panel. Behavior change: the filter text is now kept between openings of the panel; set `resetFilterOnHide` to clear it on close, as before. All other changes are additive.

## 0.1.0

### Minor Changes

- MedraUi's initial technical foundation: Angular 21 monorepo (workspace + ng-packagr), Tailwind v4 build pipeline separate from ng-packagr, `mergeClasses()` helper (CVA + tailwind-merge), and test stack (Jest, Angular Testing Library, Playwright E2E).
