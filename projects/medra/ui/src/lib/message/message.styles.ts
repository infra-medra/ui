import { cva, type VariantProps } from 'class-variance-authority';

export type MessageSeverity = 'info' | 'success' | 'warn' | 'danger';
export type MessageSize = 'sm' | 'default' | 'lg';

/** Icon size per `size` — main severity icon. */
export const MESSAGE_ICON_SIZE_CLASS: Record<MessageSize, string> = {
  sm: 'size-4',
  default: 'size-5',
  lg: 'size-6',
};

/** Close-button icon size per `size`, kept a notch below the main icon (matches the existing default proportions). */
export const MESSAGE_CLOSE_ICON_SIZE_CLASS: Record<MessageSize, string> = {
  sm: 'size-3',
  default: 'size-4',
  lg: 'size-5',
};

/** Icon shown per severity when the consumer doesn't override it (Message/Toast). */
export const MESSAGE_SEVERITY_ICON: Record<MessageSeverity, string> = {
  info: 'information-circle',
  success: 'check-circle',
  warn: 'exclamation-triangle',
  danger: 'x-circle',
};

/** Icon color per severity, kept separate from the card background/border/text classes below. */
export const MESSAGE_SEVERITY_ICON_CLASS: Record<MessageSeverity, string> = {
  info: 'text-info-500 dark:text-info-400',
  success: 'text-success-500 dark:text-success-400',
  warn: 'text-warn-500 dark:text-warn-400',
  danger: 'text-danger-500 dark:text-danger-400',
};

/**
 * "Soft" tinted card style shared by Message (inline, static) and Toast
 * (floating, ephemeral) — same visual language, different lifecycle/host.
 * Written as full literal strings per severity (not template-literal
 * interpolation) so Tailwind's scanner can find them — see button.styles.ts.
 */
export const messageCardVariants = cva(['flex items-start rounded-lg border'], {
  variants: {
    severity: {
      info: 'border-info-200 bg-info-50 text-info-800 dark:border-info-800 dark:bg-info-950 dark:text-info-200',
      success: 'border-success-200 bg-success-50 text-success-800 dark:border-success-800 dark:bg-success-950 dark:text-success-200',
      warn: 'border-warn-200 bg-warn-50 text-warn-800 dark:border-warn-800 dark:bg-warn-950 dark:text-warn-200',
      danger: 'border-danger-200 bg-danger-50 text-danger-800 dark:border-danger-800 dark:bg-danger-950 dark:text-danger-200',
    },
    /** — same two sizes, `sm`/`lg`, matching this library's own `sm`/`default`/`lg` naming. */
    size: {
      sm: 'gap-2 p-2 text-xs',
      default: 'gap-3 p-4 text-sm',
      lg: 'gap-4 p-5 text-base',
    },
  },
  defaultVariants: {
    severity: 'info',
    size: 'default',
  },
});

export type MessageCardVariantProps = VariantProps<typeof messageCardVariants>;
