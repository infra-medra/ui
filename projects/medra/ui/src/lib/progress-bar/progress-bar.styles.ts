export type ProgressBarSize = 'sm' | 'default' | 'lg';
export type ProgressBarMode = 'determinate' | 'indeterminate';

/** Track (background) height per size — the fill is always `h-full` of it. */
export const PROGRESS_BAR_TRACK_SIZE_CLASS: Record<ProgressBarSize, string> = {
  sm: 'h-1.5',
  default: 'h-2.5',
  lg: 'h-4',
};
