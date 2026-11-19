import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { mergeClasses } from '../utils/merge-classes';
import {
  CustomIconData,
  FontAwesomeIconDefinition,
  IconValue,
  IconVariant,
  MED_ICONS,
  fromFontAwesome,
} from './icon-registry';

interface VariantConfig {
  viewBox: string;
  fill: string;
  stroke: string | null;
  strokeWidth: string | null;
}

const VARIANT_CONFIG: Record<IconVariant, VariantConfig> = {
  outline: { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '1.5' },
  solid: { viewBox: '0 0 24 24', fill: 'currentColor', stroke: null, strokeWidth: null },
  mini: { viewBox: '0 0 20 20', fill: 'currentColor', stroke: null, strokeWidth: null },
  micro: { viewBox: '0 0 16 16', fill: 'currentColor', stroke: null, strokeWidth: null },
};

/** Converts `grip-vertical` (kebab-case icon name) to `gripVertical` (generated key). */
function toCamelCase(kebabOrCamel: string): string {
  return kebabOrCamel.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

function isFontAwesomeIcon(value: unknown): value is FontAwesomeIconDefinition {
  return (
    typeof value === 'object' &&
    value !== null &&
    'icon' in value &&
    Array.isArray((value as FontAwesomeIconDefinition).icon) &&
    (value as FontAwesomeIconDefinition).icon.length >= 2
  );
}

function isCustomIconData(value: unknown): value is CustomIconData {
  return (
    typeof value === 'object' &&
    value !== null &&
    'viewBox' in value &&
    'markup' in value
  );
}

function isFontClassString(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith('<')) return false;
  if (trimmed.includes(' ')) return true;
  return /^(pi|ri|bi|ti)-/.test(trimmed);
}

function parseSvgString(svg: string, defaultViewBox: string): { viewBox: string; markup: string } {
  const trimmed = svg.trim();
  if (trimmed.startsWith('<svg')) {
    const viewBoxMatch = trimmed.match(/viewBox=["']([^"']+)["']/i);
    const viewBox = viewBoxMatch ? viewBoxMatch[1] : defaultViewBox;
    const innerMatch = trimmed.match(/<svg[^>]*>([\s\S]*)<\/svg>/i);
    const markup = innerMatch ? innerMatch[1].trim() : trimmed;
    return { viewBox, markup };
  }
  return { viewBox: defaultViewBox, markup: trimmed };
}

/**
 * Universal icon wrapper (Heroicons, Font Awesome SVG/CDN, and custom SVG glyphs).
 * Supports:
 * 1. Registered SVG icons via `provideIcons()`
 * 2. Direct Font Awesome icon definitions via `[icon]`
 * 3. CSS font icons via CDN (e.g. `fontIcon="fa-solid fa-coffee"` or `name="fa-solid fa-coffee"`)
 */
@Component({
  selector: 'med-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex items-center' },
  template: `
    @if (isFontIcon()) {
      <i
        [class]="fontIconClasses()"
        [attr.role]="ariaLabel() ? 'img' : null"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-hidden]="ariaLabel() ? null : 'true'"
      ></i>
    } @else {
      <svg
        #svg
        [attr.viewBox]="config().viewBox"
        [attr.fill]="config().fill"
        [attr.stroke]="config().stroke"
        [attr.stroke-width]="config().strokeWidth"
        [attr.role]="ariaLabel() ? 'img' : null"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-hidden]="ariaLabel() ? null : 'true'"
        [class]="hostClass()"
      ></svg>
    }
  `,
})
export class IconComponent {
  private readonly iconSets = inject(MED_ICONS, { optional: true }) ?? [];
  private readonly svgRef = viewChild<ElementRef<SVGSVGElement>>('svg');

  /**
   * Direct icon definition (Font Awesome icon, CustomIconData, or SVG string).
   * When provided, takes precedence over `name` lookup in `MED_ICONS`.
   */
  readonly icon = input<IconValue | null>(null);

  /**
   * Direct CSS font icon class (e.g. 'fa-solid fa-coffee', 'fa-brands fa-github').
   * Used when Font Awesome is loaded via CDN (CSS / webfonts).
   */
  readonly fontIcon = input<string | null>(null);

  /** Icon name: kebab-case (`grip-vertical`, `coffee`) or font class (`fa-solid fa-coffee`). */
  readonly name = input<string>('');
  readonly variant = input<IconVariant>('outline');
  /** Optional accessible label. Without it, the icon is treated as decorative (`aria-hidden`). */
  readonly ariaLabel = input<string | null>(null);
  readonly class = input('', { alias: 'class' });

  /** Resolved font class string if this instance renders as a CSS font icon, or null. */
  protected readonly fontClassString = computed<string | null>(() => {
    const directFont = this.fontIcon()?.trim();
    if (directFont) return directFont;

    const rawIcon = this.icon();
    if (isFontClassString(rawIcon)) return rawIcon.trim();

    const name = this.name()?.trim();
    if (name) {
      if (this.findIconInSets(name, this.variant()) !== undefined) {
        return null;
      }
      if (isFontClassString(name)) {
        return name;
      }
    }

    return null;
  });

  /** Returns true if this instance should render as a CSS font icon (`<i>`) instead of an `<svg>`. */
  protected readonly isFontIcon = computed(() => this.fontClassString() !== null);

  protected readonly fontIconClasses = computed(() => {
    const iconClass = this.fontClassString() ?? '';
    return mergeClasses('inline-flex items-center justify-center leading-none', iconClass, this.class());
  });

  private findIconInSets(rawName: string, variant: IconVariant): IconValue | undefined {
    if (!rawName) return undefined;

    const camelKey = toCamelCase(rawName);
    const candidateKeys = [camelKey];
    if (camelKey !== rawName) {
      candidateKeys.push(rawName);
    }
    if (!camelKey.startsWith('fa')) {
      candidateKeys.push('fa' + camelKey.charAt(0).toUpperCase() + camelKey.slice(1));
    } else {
      const stripped = camelKey.slice(2);
      if (stripped.length > 0) {
        candidateKeys.push(stripped.charAt(0).toLowerCase() + stripped.slice(1));
      }
    }

    // 1. Try exact requested variant first
    for (const set of this.iconSets) {
      const variantSet = set[variant];
      if (variantSet) {
        for (const key of candidateKeys) {
          if (variantSet[key] !== undefined) {
            return variantSet[key];
          }
        }
      }
    }

    // 2. Fallback to other registered variants (e.g. solid, default)
    for (const set of this.iconSets) {
      for (const [v, variantSet] of Object.entries(set)) {
        if (v === variant || !variantSet) continue;
        for (const key of candidateKeys) {
          if (variantSet[key] !== undefined) {
            return variantSet[key];
          }
        }
      }
    }

    return undefined;
  }

  protected readonly resolved = computed<{
    viewBox: string;
    fill: string;
    stroke: string | null;
    strokeWidth: string | null;
    markup: string;
    missing: boolean;
  }>(() => {
    // If it's a font icon, resolved SVG properties are not used
    if (this.isFontIcon()) {
      return {
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: null,
        strokeWidth: null,
        markup: '',
        missing: false,
      };
    }

    const rawIcon = this.icon();
    const variant = this.variant();
    const variantCfg = VARIANT_CONFIG[variant] ?? VARIANT_CONFIG.outline;

    let target: IconValue | undefined = rawIcon ?? undefined;

    if (target === undefined) {
      const name = this.name();
      target = this.findIconInSets(name, variant);

      if (target === undefined) {
        if (name) {
          console.warn(
            `[med-icon] Icon "${name}" (variant "${variant}") was not registered. Use provideIcons() to register it.`,
          );
        }
        return {
          viewBox: variantCfg.viewBox,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: '1.5',
          markup:
            '<rect x="10%" y="10%" width="80%" height="80%" rx="2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 2" opacity="0.6"/>',
          missing: true,
        };
      }
    }

    if (isFontAwesomeIcon(target)) {
      const converted = fromFontAwesome(target);
      return {
        viewBox: converted.viewBox,
        fill: converted.fill ?? 'currentColor',
        stroke: converted.stroke ?? null,
        strokeWidth: converted.strokeWidth ?? null,
        markup: converted.markup,
        missing: false,
      };
    }

    if (isCustomIconData(target)) {
      return {
        viewBox: target.viewBox,
        fill: target.fill ?? (variant === 'outline' ? 'none' : 'currentColor'),
        stroke: target.stroke !== undefined ? target.stroke : (variant === 'outline' ? 'currentColor' : null),
        strokeWidth: target.strokeWidth !== undefined ? target.strokeWidth : (variant === 'outline' ? '1.5' : null),
        markup: target.markup,
        missing: false,
      };
    }

    if (typeof target === 'string') {
      const parsed = parseSvgString(target, variantCfg.viewBox);
      return {
        viewBox: parsed.viewBox,
        fill: variantCfg.fill,
        stroke: variantCfg.stroke,
        strokeWidth: variantCfg.strokeWidth,
        markup: parsed.markup,
        missing: false,
      };
    }

    return {
      viewBox: variantCfg.viewBox,
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '1.5',
      markup:
        '<rect x="10%" y="10%" width="80%" height="80%" rx="2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 2" opacity="0.6"/>',
      missing: true,
    };
  });

  protected readonly config = computed(() => ({
    viewBox: this.resolved().viewBox,
    fill: this.resolved().fill,
    stroke: this.resolved().stroke,
    strokeWidth: this.resolved().strokeWidth,
  }));

  protected readonly missing = computed(() => this.resolved().missing);

  protected readonly markup = computed<string>(() => this.resolved().markup);

  protected readonly hostClass = computed(() =>
    mergeClasses('inline-block shrink-0 size-[var(--icon-size,1.5rem)]', this.class()),
  );

  constructor() {
    afterRenderEffect(() => {
      const svg = this.svgRef();
      if (svg) {
        svg.nativeElement.innerHTML = this.markup();
      }
    });
  }
}
