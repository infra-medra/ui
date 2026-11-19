import { Directive, InjectionToken, Signal, booleanAttribute, computed, inject, input } from '@angular/core';
import { mergeClasses } from '../utils/merge-classes';

/**
 * Injection token exposing the active fluid layout state from an ancestor `Fluid` (`medFluid`) container.
 */
export const MED_FLUID_CONTEXT = new InjectionToken<Signal<boolean>>('MED_FLUID_CONTEXT');

function coerceFluidInput(value: unknown): boolean {
  if (value === '' || value === undefined || value === null) {
    return true;
  }
  return booleanAttribute(value);
}

/**
 * Utility container directive that opts descendant form and button controls into full-width fluid layout.
 * Supports both `<med-fluid>` element usage and `[medFluid]` attribute usage.
 */
@Directive({
  selector: 'med-fluid, [medFluid]',
  standalone: true,
  host: {
    '[class]': 'hostClass()',
    '[attr.data-fluid]': 'isFluid() ? "true" : null',
  },
  providers: [
    {
      provide: MED_FLUID_CONTEXT,
      useFactory: () => inject(FluidDirective).isFluid,
    },
  ],
})
export class FluidDirective {
  readonly medFluid = input(true, { transform: coerceFluidInput });
  readonly fluid = input<boolean | undefined>(undefined);
  readonly class = input('', { alias: 'class' });

  readonly isFluid = computed(() => {
    const explicitFluid = this.fluid();
    return explicitFluid !== undefined ? explicitFluid : this.medFluid();
  });

  protected readonly hostClass = computed(() =>
    mergeClasses(this.isFluid() ? 'block w-full' : '', this.class()),
  );
}

/** An alias for `FluidDirective`. */
export const Fluid = FluidDirective;
