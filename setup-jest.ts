import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless';
import '@testing-library/jest-dom';

setupZonelessTestEnv();

// jsdom doesn't implement Element.scrollIntoView (it's a real layout/scrolling API) — components that call it for keyboard-navigation UX (e.g. Autocomplete's suggestion panel) would otherwise throw in every test that exercises that path.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

// jsdom has no layout engine, so it doesn't implement ResizeObserver either (e.g. Tabs' overflow-menu measurement). A no-op stub is enough: it never fires, so measured sizes stay 0 and components fall back to their "not measured yet" behavior, same as scrollIntoView above.
if (typeof ResizeObserver === 'undefined') {
  (globalThis as { ResizeObserver?: unknown }).ResizeObserver = class {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  };
}

// jsdom doesn't implement the Pointer Events capture methods at all (not even as a throwing stub) — Slider calls setPointerCapture() on every pointerdown so a drag keeps tracking the track element regardless of where the pointer ends up, and would otherwise throw in every test that dispatches a real pointerdown.
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {};
  Element.prototype.releasePointerCapture = () => {};
  Element.prototype.hasPointerCapture = () => false;
}

// jsdom doesn't implement the (deprecated but still relied-upon) execCommand/queryCommandState APIs at all — not even as a property that exists to be jest.spyOn()'d — so Editor's toolbar commands need a stub present before individual tests can mock its behavior.
if (!document.execCommand) {
  document.execCommand = () => false;
  document.queryCommandState = () => false;
}

// jsdom doesn't implement the Web Animations API (Element.animate()) at all — RippleDirective
// calls it on every real pointerdown on a medButton-decorated element (any button, everywhere
// in this library), so a test that dispatches a genuine PointerEvent at one — not just
// .click() — would otherwise throw here, unrelated to whatever that test actually means to
// exercise. `finished` only needs to be thenable/catchable (RippleDirective awaits it to know
// when to remove the ripple circle); it never needs to actually resolve for a test to pass.
if (!Element.prototype.animate) {
  Element.prototype.animate = () => ({ finished: Promise.resolve() }) as unknown as Animation;
}

// jsdom doesn't implement Element.scrollTo (another real layout/scrolling API, same
// category as scrollIntoView above) — CdkVirtualScrollViewport calls it internally from
// scrollToIndex(), so VirtualScroller's own passthrough scrollToIndex() would otherwise
// throw in every test that calls it.
if (!Element.prototype.scrollTo) {
  Element.prototype.scrollTo = () => {};
}

// jsdom implements Blob but not URL.createObjectURL/revokeObjectURL — DataTable's
// exportCSV() needs both to trigger a real download in the browser. The mock URL is
// never read back; tests that care about the exported content spy on createObjectURL
// directly to capture the real Blob it was called with.
if (!URL.createObjectURL) {
  URL.createObjectURL = () => 'blob:mock-url';
  URL.revokeObjectURL = () => {};
}
