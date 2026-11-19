import { OrgChartNode, OrgChartSelectionMode } from './organization-chart.types';

/**
 * Coordinator `OrgChartNodeComponent` reaches up to via DI
 * (`inject(OrgChartHost)`) — selection state lives on the top-level
 * `OrganizationChartComponent` (one `selection` model for the whole tree),
 * but the click that changes it happens deep inside whichever recursively-
 * nested `OrgChartNodeComponent` the user actually clicked. Same reverse-
 * direction DI shape `AccordionHost`/`SplitterHost` already established in
 * this library (see either's own doc for why an abstract class avoids a
 * circular import between the host and the leaf component) — `mode()` is
 * read too, not just the two write actions, so a node knows whether to
 * render itself as selectable at all without needing its own
 * `selectionMode` input threaded through every recursive level.
 */
export abstract class OrgChartHost {
  abstract mode(): OrgChartSelectionMode;
  abstract isSelected(node: OrgChartNode): boolean;
  /** Only meaningful in `'checkbox'` mode — some but not all of `node`'s selectable descendants are checked. Always `false` in every other mode. */
  abstract isIndeterminate(node: OrgChartNode): boolean;
  abstract toggleSelect(node: OrgChartNode): void;
  /** Reports a node's expand/collapse state actually changing (click on the toggle, or ArrowDown expanding a collapsed node) — see `OrganizationChartComponent`'s own `nodeExpand`/`nodeCollapse` outputs. */
  abstract reportExpandedChange(node: OrgChartNode, expanded: boolean): void;
}
