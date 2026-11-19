/** Maturity label shown next to a component page title. */
export type ComponentStatus = 'stable' | 'beta' | 'new';

/**
 * Status per component slug. Slugs absent from the map resolve to `stable`,
 * so every component starts stable until it is explicitly reclassified.
 */
export const COMPONENT_STATUS: Readonly<Record<string, ComponentStatus>> = {};

/** Resolves the status badge for a component slug, defaulting to `stable`. */
export function resolveStatus(
  slug: string,
  map: Readonly<Record<string, ComponentStatus>> = COMPONENT_STATUS,
): ComponentStatus {
  return Object.prototype.hasOwnProperty.call(map, slug) ? map[slug] : 'stable';
}
