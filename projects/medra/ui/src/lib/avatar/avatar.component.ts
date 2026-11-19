import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { ButtonSeverity, SOLID_SEVERITY_BG } from '../button/button.styles';
import { IconComponent } from '../icon/icon.component';
import { mergeClasses } from '../utils/merge-classes';
import { AVATAR_ICON_SIZE_CLASS, AVATAR_SHAPE_CLASS, AvatarShape, AVATAR_SIZE_CLASS, AvatarSize } from './avatar.styles';

/**
 * Avatar primitive (Tier 1). Fallback priority: `image` (until it fails to
 * load, then falls through) → `label` (rendered as up to 2 initials) → a
 * generic user icon. `severity` colors the solid background for the
 * label/icon fallbacks only — it's irrelevant once a real image is showing.
 *
 * **All-defaults accessible name (Wave 2 fix — 2026-08-19):** with zero
 * props set (no `image`, no `label`, no `alt`), the container previously
 * rendered with no `aria-label` at all and a purely decorative icon — an
 * unlabeled, confusing stop for screen readers announcing nothing about why
 * it exists. Rather than inventing a generic fallback string (there is
 * genuinely no identifying information to announce), the container now gets
 * `aria-hidden="true"` in that exact state, matching how the equivalent
 * empty state is already handled elsewhere in this library (e.g. a
 * decorative checkbox box or icon marked `aria-hidden` when it carries no
 * information of its own). Any real `label` or `alt` still produces a real
 * `aria-label` as before — this only affects the true "nothing to say"
 * case.
 */
@Component({
  selector: 'med-avatar',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-block' },
  template: `
    <span [class]="containerClass()" [attr.aria-label]="fallbackAriaLabel()" [attr.aria-hidden]="isDecorative() ? 'true' : null">
      @if (image() && !imageFailed()) {
        <img [src]="image()" [alt]="alt()" class="size-full object-cover" (error)="handleImageError($event)" />
      } @else if (initials()) {
        <span class="font-medium leading-none">{{ initials() }}</span>
      } @else {
        <med-icon name="user" variant="solid" [class]="iconSizeClass()" />
      }
    </span>
  `,
})
export class AvatarComponent {
  readonly image = input<string | null>(null);
  readonly alt = input('');
  readonly label = input<string | null>(null);
  readonly severity = input<ButtonSeverity>('secondary');
  readonly size = input<AvatarSize>('default');
  readonly shape = input<AvatarShape>('circle');
  readonly class = input('', { alias: 'class' });

  readonly onImageError = output<Event>();

  private readonly failedUrl = signal<string | null>(null);
  protected readonly imageFailed = computed(() => this.image() !== null && this.failedUrl() === this.image());

  protected readonly initials = computed(() => {
    const parts = (this.label() ?? '').trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return '';
    }
    const first = parts[0][0];
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  });

  protected readonly showsFallbackBackground = computed(() => !this.image() || this.imageFailed());

  protected readonly fallbackAriaLabel = computed(() => (this.showsFallbackBackground() ? this.label() || this.alt() || null : null));
  /** True only in the all-defaults "nothing to announce" state: showing the fallback icon/background with no `label` and no `alt` at all. */
  protected readonly isDecorative = computed(() => this.showsFallbackBackground() && !this.fallbackAriaLabel());

  protected readonly containerClass = computed(() =>
    mergeClasses(
      'inline-flex select-none items-center justify-center overflow-hidden font-medium',
      AVATAR_SIZE_CLASS[this.size()],
      AVATAR_SHAPE_CLASS[this.shape()],
      this.showsFallbackBackground() ? `text-white ${SOLID_SEVERITY_BG[this.severity()]}` : '',
      this.class(),
    ),
  );
  protected readonly iconSizeClass = computed(() => AVATAR_ICON_SIZE_CLASS[this.size()]);

  protected handleImageError(event: Event): void {
    this.failedUrl.set(this.image());
    this.onImageError.emit(event);
  }
}
