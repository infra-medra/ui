/** What `AccordionHost` needs to know about a tab, without depending on the concrete `AccordionTabComponent` class (see `AccordionHost`'s own doc). */
export interface AccordionTabLike {
  disabled(): boolean;
  focus(): void;
}

/**
 * Coordinator `AccordionTabComponent` reaches up to via DI
 * (`inject(AccordionHost)`) to request a toggle or ask for cross-header
 * arrow-key navigation — the reverse direction of the plain signal
 * push-down `AccordionComponent` already uses for `expanded`/`panelId`/
 * `headerButtonId` (see `accordion-tab.component.ts`). That push-down
 * direction alone can't carry click/keydown *back up*, because
 * `AccordionTabComponent` instances are declared in the *consumer's*
 * template (`<med-accordion><med-accordion-tab>...`), not
 * `AccordionComponent`'s own — there's no template position there to bind
 * `(click)`/`(keydown)` handlers on them the way `TabsComponent` binds
 * them on its own `@for`-rendered header buttons.
 *
 * An abstract class (not the concrete `AccordionComponent`) specifically so
 * `accordion-tab.component.ts` doesn't have to import `accordion.component.ts`
 * at all: `AccordionComponent` already imports `AccordionTabComponent`
 * directly (needed for its `contentChildren()` query token), so importing
 * the concrete class back the other way would create a circular import
 * between the two files. Same technique Angular CDK's own
 * Accordion/AccordionItem use for this exact parent-coordinator shape.
 */
export abstract class AccordionHost {
  abstract requestToggle(tab: AccordionTabLike): void;
  abstract requestFocusMove(event: KeyboardEvent, tab: AccordionTabLike): void;
}
