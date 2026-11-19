# Feedback and Status

**Capability:** `feedback-and-status`
**ID prefix:** `FBK`
**Paths:** `projects/medra/ui/src/lib/message/**`, `projects/medra/ui/src/lib/inline-message/**`, `projects/medra/ui/src/lib/badge/**`, `projects/medra/ui/src/lib/overlay-badge/**`, `projects/medra/ui/src/lib/tag/**`, `projects/medra/ui/src/lib/chip/**`, `projects/medra/ui/src/lib/avatar/**`, `projects/medra/ui/src/lib/progress-bar/**`, `projects/medra/ui/src/lib/progress-spinner/**`, `projects/medra/ui/src/lib/meter-group/**`, `projects/medra/ui/src/lib/skeleton/**`

## Purpose

Communicates state to users through messages, badges, tags, chips, avatars, progress indicators, meters and loading placeholders. These components display information and, where interactive (closing a message, removing a chip), emit an event instead of removing themselves.

## Requirements

### REQ FBK-001: Message severity and announcement

`med-message` SHALL render projected content with a `severity` of `info` (default), `success`, `warn` or `danger`, each with its own default icon. It SHALL expose `role="status"` and `aria-live="polite"`, except `danger`, which SHALL escalate to `role="alert"` and `aria-live="assertive"`. The `icon` input SHALL override the default icon and `size` (`sm`, `default`, `lg`) SHALL change its padding.

#### Scenario FBK-001.S1: Default severity

- **Given** a message with no severity
- **When** it renders
- **Then** it uses the info style and `role="status"`

#### Scenario FBK-001.S2: Danger escalation

- **Given** a message with `severity="danger"`
- **When** it renders
- **Then** the host has `role="alert"` and `aria-live="assertive"`

#### Scenario FBK-001.S3: Icon override

- **Given** a message with a custom `icon`
- **When** it renders
- **Then** the custom icon replaces the severity icon

### REQ FBK-002: Message closing

`med-message` SHALL render a close button (labeled by `closeLabel`, default "Close") only when `closable` is true. Activating it, or the elapse of `life` milliseconds, SHALL emit `closed`. The component SHALL NOT remove itself, and SHALL NOT auto-close when `life` is unset; destroying it SHALL cancel a pending `life` timer.

#### Scenario FBK-002.S1: No close button by default

- **Given** a message without `closable`
- **When** it renders
- **Then** no close button exists

#### Scenario FBK-002.S2: Close click

- **Given** a closable message
- **When** the user clicks the close button
- **Then** `closed` emits and the message remains in the DOM

#### Scenario FBK-002.S3: Life timer

- **Given** a message with `life` 3000
- **When** 3000 ms elapse
- **Then** `closed` emits automatically

#### Scenario FBK-002.S4: Destroy before expiry

- **Given** a message with `life` set
- **When** it is destroyed before the time elapses
- **Then** `closed` never emits

### REQ FBK-003: Inline message

`med-inline-message` SHALL render inline (not block) with projected text, the same four severities as `med-message`, and `role="status"` with `aria-live="polite"`. It SHALL NOT render a close button.

#### Scenario FBK-003.S1: Live region

- **Given** an inline message of any severity
- **When** it renders
- **Then** it is a polite status region and is inline

#### Scenario FBK-003.S2: No close

- **Given** an inline message
- **When** it renders
- **Then** it has no close button

### REQ FBK-004: Badge

`med-badge` SHALL render its projected content or the `value` input, styled by `severity` (default `primary`) and `size` (`sm`, `default`, `lg`, `xl`). With `dot` it SHALL render as a small dot without content padding, named for assistive technology by `ariaLabel` through screen-reader-only text only in dot mode and decorative when no label is set. With `badgeDisabled` it SHALL be hidden.

#### Scenario FBK-004.S1: Value

- **Given** a badge with `value="5"`
- **When** it renders
- **Then** "5" is shown

#### Scenario FBK-004.S2: Labeled dot

- **Given** a badge with `dot` and `ariaLabel="Unread"`
- **When** it renders
- **Then** a screen-reader-only "Unread" is present

#### Scenario FBK-004.S3: Label outside dot mode

- **Given** a non-dot badge with `ariaLabel`
- **When** it renders
- **Then** the projected content is shown and the label is ignored

#### Scenario FBK-004.S4: Disabled

- **Given** a badge with `badgeDisabled`
- **When** it renders
- **Then** the host carries the `hidden` attribute

### REQ FBK-005: Overlay badge

`med-overlay-badge` SHALL render its wrapped content with a badge placed at `position` (`top-right` default, `top-left`, `bottom-right`, `bottom-left`), with `severity` default `danger` and `size` default `sm`. The `value` SHALL be hidden from assistive technology, omitted in `dot` mode, and a screen-reader-only text SHALL appear only when `badgeAriaLabel` is set. With `hidden` it SHALL hide the badge while keeping the wrapped content.

#### Scenario FBK-005.S1: Value badge

- **Given** an overlay badge with `value="3"` around an icon
- **When** it renders
- **Then** the icon and a top-right badge "3" are shown, the badge text being `aria-hidden`

#### Scenario FBK-005.S2: Announcement

- **Given** an overlay badge with `badgeAriaLabel="3 notifications"`
- **When** it renders
- **Then** a screen-reader-only span with that text exists

#### Scenario FBK-005.S3: Hidden

- **Given** an overlay badge with `hidden` true
- **When** it renders
- **Then** the badge is not shown and the wrapped content is

### REQ FBK-006: Tag

`med-tag` SHALL render projected content or the `value` input, styled by `severity` (default `primary`), with square corners unless `pill` is true. It SHALL render a leading icon only when `icon` is set.

#### Scenario FBK-006.S1: Pill

- **Given** a tag with `pill`
- **When** it renders
- **Then** it is fully rounded

#### Scenario FBK-006.S2: Icon

- **Given** a tag with `icon` set
- **When** it renders
- **Then** a leading icon is shown, and none when unset

### REQ FBK-007: Chip content

`med-chip` SHALL render projected content or the `label` input with an optional leading `image` (with `imageAlt`) or `icon`, preferring the image when both are set. When the image fails to load it SHALL fall back to the icon, or to nothing if no icon is set, and SHALL recover when `image` changes.

#### Scenario FBK-007.S1: Image preferred

- **Given** a chip with both `image` and `icon`
- **When** it renders
- **Then** the image is shown and the icon is not

#### Scenario FBK-007.S2: Image failure

- **Given** a chip with `image` and `icon`
- **When** the image fails to load
- **Then** the icon is shown

### REQ FBK-008: Chip removal

`med-chip` SHALL render a native remove button (labeled by `removeLabel`, default "Remove", with a visible focus ring) only when `removable` is true. Clicking it, or pressing Backspace while it is focused, SHALL emit `removed` with the event; other keys SHALL NOT. A projected `#removeicon` template SHALL replace the default close icon.

#### Scenario FBK-008.S1: Click

- **Given** a removable chip
- **When** the user clicks the remove button
- **Then** `removed` emits

#### Scenario FBK-008.S2: Backspace

- **Given** a focused remove button
- **When** the user presses Backspace
- **Then** `removed` emits with the keyboard event

#### Scenario FBK-008.S3: Other keys

- **Given** a focused remove button
- **When** the user presses the Escape key
- **Then** `removed` does not emit

### REQ FBK-009: Avatar content

`med-avatar` SHALL show an image when `image` is set, otherwise initials derived from `label`, otherwise a generic user icon. When the image fails it SHALL emit `onImageError` and fall back to the initials or icon, recovering when `image` changes to a different URL. `size` (`sm`, `default`, `lg`, `xl`) and `shape` (`circle` default, `square`) SHALL style it, and `severity` background SHALL apply only to the fallback, not to an image.

#### Scenario FBK-009.S1: Default

- **Given** an avatar without `image` or `label`
- **When** it renders
- **Then** the generic user icon is shown

#### Scenario FBK-009.S2: Image failure

- **Given** an avatar with `image` and `label`
- **When** the image fails to load
- **Then** `onImageError` emits and initials are shown

### REQ FBK-010: Avatar accessibility and group

`med-avatar` SHALL be `aria-hidden` when it has no image, label or alt, and SHALL expose the `label` as `aria-label` on its container when showing a fallback (but not while an image is showing, since the `<img>` uses `alt`). `med-avatar-group` SHALL render its projected avatars in a wrapper with negative overlap.

#### Scenario FBK-010.S1: Decorative avatar

- **Given** an avatar with no image, label or alt
- **When** it renders
- **Then** it is `aria-hidden`

#### Scenario FBK-010.S2: Labeled fallback

- **Given** an avatar with `label="Ana Lima"` and no image
- **When** it renders
- **Then** it is not hidden and its `aria-label` is "Ana Lima"

#### Scenario FBK-010.S3: Group

- **Given** three avatars inside `med-avatar-group`
- **When** it renders
- **Then** adjacent avatars overlap

### REQ FBK-011: Progress bar

`med-progress-bar` SHALL expose `role="progressbar"` with `aria-valuemin` 0, `aria-valuemax` 100 and an `aria-label` (default "Progress"). In `determinate` mode (default) it SHALL set `aria-valuenow` to the value clamped to 0-100 and size the fill proportionally; in `indeterminate` mode it SHALL omit `aria-valuenow` and never show the numeric label. With `showValue` it SHALL show the value with `unit` (default "%"), or a projected `#content` template receiving the value.

#### Scenario FBK-011.S1: Defaults

- **Given** a progress bar with no inputs
- **When** it renders
- **Then** `aria-valuenow` is 0 and `aria-label` is "Progress"

#### Scenario FBK-011.S2: Label

- **Given** a progress bar with `value` 40 and `showValue`
- **When** it renders
- **Then** "40%" is shown

#### Scenario FBK-011.S3: Indeterminate

- **Given** a progress bar in `indeterminate` mode with `showValue`
- **When** it renders
- **Then** there is no `aria-valuenow` and no numeric label

### REQ FBK-012: Progress spinner

`med-progress-spinner` SHALL render an animated spinner with `role="status"` and an `aria-label` (default "Loading"), styled by `severity`, `size` and `strokeWidth` (default "5").

#### Scenario FBK-012.S1: Default label

- **Given** a progress spinner
- **When** it renders
- **Then** it has `role="status"` and `aria-label="Loading"`

#### Scenario FBK-012.S2: Stroke width

- **Given** a spinner with `strokeWidth="8"`
- **When** it renders
- **Then** its circles use stroke width 8

### REQ FBK-013: Meter group segments

`med-meter-group` SHALL render one segment per item in `value`, sized as `(value - min) / (max - min)` of the track (defaults `min` 0, `max` 100), clamped at 100% and showing every segment at 100% when `min` equals `max`. Items without a `severity` SHALL take a rotating default palette by position. `orientation="vertical"` SHALL size by height using `verticalHeight`. It SHALL render without error for an empty array.

#### Scenario FBK-013.S1: Proportional sizes

- **Given** items valued 30 and 20 with `max` 100
- **When** it renders
- **Then** the segments are 30% and 20% of the bar

#### Scenario FBK-013.S2: Overflow

- **Given** an item valued above `max`
- **When** it renders
- **Then** its segment is clamped to 100%

#### Scenario FBK-013.S3: Empty

- **Given** an empty `value`
- **When** it renders
- **Then** no segment and no legend render

### REQ FBK-014: Meter group legend and templates

`med-meter-group` SHALL hide its bar from assistive technology and carry the accessible information in a legend listing label, value and `unit` per item. `showLegend` false SHALL hide the legend visually but keep it screen-reader accessible. `labelPosition` SHALL place the legend `end` (default) or `start`. Projected `#start`, `#end`, `#meter`, `#icon` and `#label` templates SHALL replace the corresponding default parts.

#### Scenario FBK-014.S1: Hidden legend

- **Given** a meter group with `showLegend` false and items
- **When** it renders
- **Then** the legend is visually hidden but readable by assistive technology

#### Scenario FBK-014.S2: Legend first

- **Given** `labelPosition="start"`
- **When** it renders
- **Then** the legend precedes the bar

#### Scenario FBK-014.S3: Custom meter

- **Given** a projected `#meter` template
- **When** it renders
- **Then** it replaces the default colored segment

### REQ FBK-015: Skeleton

`med-skeleton` SHALL render a decorative placeholder that is always `aria-hidden`, defaulting to a 100% wide, 1rem tall rectangle with the `wave` animation. `shape="circle"` SHALL make it fully rounded, `animation="none"` SHALL remove the shimmer, `width`/`height` SHALL apply as inline styles, `size` SHALL override both, and `borderRadius` SHALL override the shape radius.

#### Scenario FBK-015.S1: Defaults

- **Given** a skeleton with no inputs
- **When** it renders
- **Then** it is a 100% by 1rem rectangle with shimmer and `aria-hidden="true"`

#### Scenario FBK-015.S2: Size override

- **Given** a skeleton with `size="3rem"` and `height="1rem"`
- **When** it renders
- **Then** both width and height are 3rem
