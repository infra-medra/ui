export interface GalleriaItem {
  readonly src: string;
  /** Falls back to `src` itself when omitted. */
  readonly thumbnailSrc?: string;
  readonly alt?: string;
}

export type GalleriaPosition = 'bottom' | 'top' | 'left' | 'right';

/** One breakpoint tier for `responsiveOptions` — same shape/resolution rule as `CarouselResponsiveOption`, minus `numScroll` (there's nothing to scroll by here, only a thumbnail strip length to resize). */
export interface GalleriaResponsiveOption {
  readonly breakpoint: string;
  readonly numVisible: number;
}
