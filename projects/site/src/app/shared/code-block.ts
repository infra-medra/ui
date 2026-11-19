import { Component, input, signal } from '@angular/core';
import { ButtonDirective, IconComponent } from '@medra.dev/ui';

/**
 * Displays a component demo's actual template source as a read-only code block.
 * The `code` input is always the exact `.html` file a `*.demo.ts` component loads via
 * `templateUrl` (imported with Vite's `?raw` suffix in the page) — never a hand-copied
 * duplicate — so the snippet shown here can never drift from what the live demo above it
 * actually renders. No syntax highlighting: this is a handful of lines of Angular
 * template per page, not a general-purpose code viewer, and this codebase's own
 * `ApiTableComponent` already sets the precedent of plain monospace text over a highlighter
 * dependency for exactly that reason.
 */
@Component({
  selector: 'app-code-block',
  imports: [ButtonDirective, IconComponent],
  template: `
    <div class="group relative">
      <pre class="overflow-x-auto rounded-lg border border-surface-200 bg-surface-50 p-4 pr-12 text-xs dark:border-surface-800 dark:bg-surface-900"><code class="font-mono text-surface-700 dark:text-surface-300">{{ code() }}</code></pre>
      <button
        medButton
        type="button"
        variant="text"
        severity="secondary"
        size="sm"
        iconOnly
        class="absolute top-2 right-2"
        [attr.aria-label]="copied() ? 'Copied' : 'Copy code'"
        (click)="copy()"
      >
        @if (copied()) {
          <med-icon name="check" variant="mini" />
        } @else {
          <med-icon name="document-duplicate" variant="mini" />
        }
      </button>
    </div>
  `,
})
export class CodeBlockComponent {
  readonly code = input.required<string>();
  protected readonly copied = signal(false);
  private copiedTimeout?: ReturnType<typeof setTimeout>;

  protected async copy(): Promise<void> {
    await navigator.clipboard.writeText(this.code());
    this.copied.set(true);
    clearTimeout(this.copiedTimeout);
    this.copiedTimeout = setTimeout(() => this.copied.set(false), 2000);
  }
}
