import { InjectionToken, Provider } from '@angular/core';

export type IconVariant = 'outline' | 'solid' | 'mini' | 'micro';

/**
 * Shape compatible with Font Awesome's `IconDefinition` from
 * `@fortawesome/fontawesome-common-types` or `@fortawesome/free-solid-svg-icons`.
 */
export interface FontAwesomeIconDefinition {
  prefix?: string;
  iconName?: string;
  icon: [
    width: number,
    height: number,
    ligatures?: unknown[],
    unicode?: string,
    svgPathData?: string | string[],
  ];
}

/** Custom icon definition with explicit viewBox and SVG markup. */
export interface CustomIconData {
  viewBox: string;
  markup: string;
  fill?: string;
  stroke?: string | null;
  strokeWidth?: string | null;
}

/**
 * An icon value can be:
 * - A string of inner SVG markup (e.g. Heroicons `<path.../>` assuming standard variant viewBox: 24x24, 20x20, 16x16)
 * - A Font Awesome icon definition (`FontAwesomeIconDefinition` object) with dynamic viewBox (e.g. 512x512, 640x512)
 * - A `CustomIconData` object with custom viewBox, fill, stroke, and markup
 */
export type IconValue = string | FontAwesomeIconDefinition | CustomIconData;

/** Inner SVG markup or icon definitions, keyed by icon name. */
export type IconMarkupSet = Record<string, IconValue>;

/** One or more styles of the same icon set, ready to register via `provideIcons()`. */
export type IconSet = Partial<Record<IconVariant | string, IconMarkupSet>>;

/**
 * Multi token: each `provideIcons()` call contributes one `IconSet` —
 * only the icons the consumer actually imports end up in the bundle
 * (regular ESM tree-shaking).
 */
export const MED_ICONS = new InjectionToken<IconSet[]>('MED_ICONS');

/**
 * Registers icons for use via `<med-icon name="..." variant="...">`.
 * Accepts Heroicons strings, Font Awesome icon definitions, and custom icon objects.
 * Typical usage:
 * ```ts
 * import { heroOutlineIcons, provideIcons } from '@medra/ui';
 * providers: [provideIcons({ outline: { academicCap: heroOutlineIcons.academicCap } })]
 *
 * // Font Awesome usage:
 * import { faCoffee } from '@fortawesome/free-solid-svg-icons';
 * providers: [provideIcons({ solid: { coffee: faCoffee } })]
 * ```
 */
export function provideIcons(icons: IconSet): Provider {
  return { provide: MED_ICONS, useValue: icons, multi: true };
}

/**
 * Helper to convert a Font Awesome `IconDefinition` into a `CustomIconData` object.
 * Note: `<med-icon>` and `provideIcons()` also support Font Awesome definitions directly.
 */
export function fromFontAwesome(definition: FontAwesomeIconDefinition): CustomIconData {
  const [width, height, , , rawPath] = definition.icon;
  const pathData = rawPath ?? '';
  const markup = Array.isArray(pathData)
    ? pathData.map((d, i) => `<path d="${d}" fill="currentColor"${i > 0 ? ' opacity="0.4"' : ''}/>`).join('')
    : `<path d="${pathData}"/>`;
  return {
    viewBox: `0 0 ${width} ${height}`,
    markup,
    fill: 'currentColor',
    stroke: null,
    strokeWidth: null,
  };
}
