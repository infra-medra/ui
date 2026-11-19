export type SpeedDialDirection = 'up' | 'down' | 'left' | 'right';

/** Items stack away from the main button along this axis — array order becomes visual order (first item closest to the main button). */
export const DIRECTION_CONTAINER_CLASS: Record<SpeedDialDirection, string> = {
  up: 'flex-col-reverse',
  down: 'flex-col',
  left: 'flex-row-reverse',
  right: 'flex-row',
};

/**
 * The closed-state offset each item slides in from — always rendered (not
 * `@if`-removed), so there's a real transition to animate, same "toggle a
 * class between two baked-in transform states" technique
 * `drawer.styles.ts` already uses for its own open/close slide.
 */
export const DIRECTION_CLOSED_OFFSET_CLASS: Record<SpeedDialDirection, string> = {
  up: 'translate-y-2',
  down: '-translate-y-2',
  left: 'translate-x-2',
  right: '-translate-x-2',
};
