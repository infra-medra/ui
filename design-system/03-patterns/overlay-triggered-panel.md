# Pattern: Overlay-triggered panel

The single most common structural pattern in this library: a trigger element opens a floating panel via the shared `OverlayService` (`lib/overlay/overlay.service.ts`), rather than each component reinventing positioning/dismissal/focus-management. Confirmed direct consumers (repo-wide `grep` for `OverlayService` usage, excluding comment-only mentions):

`autocomplete`, `cascade-select`, `color-picker`, `confirm-dialog`, `confirm-popup`, `context-menu`, `date-picker`, `dialog`, `drawer`, `image` (lightbox/preview, via `OverlayService.openGlobal()`), `mega-menu`, `menu`, `menubar`, `multi-select`, `password` (strength-meter popover), `popover`, `select`, `speed-dial`, `split-button`, `tiered-menu`, `toast`, `tooltip`, `tree-select`.

`listbox` and `virtual-scroller` reference `OverlayService` only in doc comments (they're rendered *inside* another component's overlay, e.g. Select's panel — they don't open their own).

## Two flavors observed

1. **Connected overlay** (`openConnected`) — panel is positioned relative to the trigger element, follows it, closes on outside-click/Escape. Used by Select, MultiSelect, AutoComplete, CascadeSelect, TreeSelect, DatePicker, ColorPicker, Menu, Menubar's submenus, MegaMenu, TieredMenu, ContextMenu, Popover, SpeedDial's own menu, SplitButton's menu, Password's strength popover.
2. **Global overlay** (`openGlobal`) — centered/viewport-level, used for content that isn't anchored to a specific trigger element: Dialog, ConfirmDialog, Drawer, Toast's container, Image's lightbox preview.

## Shared conventions found across consumers

- `aria-expanded` on the trigger reflecting open/closed state (confirmed in Select, TreeSelect, CascadeSelect docs — see `02-components/forms/`).
- `aria-haspopup` typed to the panel's actual role (`"listbox"` for Select-family triggers, `"tree"` for TreeSelect, `"menu"` for Menu-family).
- Escape-to-close and outside-click-to-close are handled by `OverlayService` itself, not reimplemented per component — confirmed explicitly in TreeSelect's doc ("dismissal is fully delegated to `OverlayService`, no manual `closeRequested` plumbing").
- `--shadow-overlay-lg` (or `-sm` for lighter panels) is the near-universal panel elevation — see `01-foundations/shadows-elevation.md`.

## Recommendation

This is a strong, consistent pattern — the audit found no case of a component reinventing its own positioning/dismissal logic instead of using `OverlayService`. New overlay-driven components should follow the same split (connected vs. global) rather than introducing a third variant.

## Source

`projects/medra/ui/src/lib/overlay/overlay.service.ts`. Per-component confirmation: see each overlay-driven component's own page in `02-components/forms/`, `02-components/navigation/`, and `02-components/feedback/`.
