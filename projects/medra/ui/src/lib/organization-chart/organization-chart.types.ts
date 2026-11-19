export interface OrgChartNode {
  readonly label: string;
  readonly children?: readonly OrgChartNode[];
  /** Initial expand state for this node's children. Default `true`. */
  readonly expanded?: boolean;
  /** Opts this node out of selection even when `selectionMode` is set (e.g. a vacant position). Default `true`. */
  readonly selectable?: boolean;
  readonly class?: string;
}

export type OrgChartSelectionMode = 'single' | 'multiple' | 'checkbox' | null;
