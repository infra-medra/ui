# Delta: Date picker

**Capability:** `date-picker`

## ADDED Requirements

### REQ DTP-016: DatePicker documentation page

`/docs/components/date-picker` SHALL present the `EXAMPLES` "On this page" index matching the documented sections in page order, and SHALL provide English prose, a live interactive demo, and a source code block for every implemented `DatePickerComponent` feature: Basic, Format, Locale, Min / Max & Disabled Dates, Multiple, Range, Time, Month Picker, Multiple Months, Drilldown Navigation, Clear Icon, Sizes, Disabled, Invalid, Float Label, Ifta Label, Signal Forms, Template Driven, and Reactive Forms.

#### Scenario DTP-016.S1: Documentation sections, live demos, and On this page navigation

- **Given** the `/docs/components/date-picker` documentation page
- **When** the page renders in a browser
- **Then** the "On this page" navigation lists every `EXAMPLES` anchor in order and each section renders English prose, a live `<med-date-picker>` demo, and a code block
- **And** interactive demos (Range, Clear Icon, Signal Forms, Template Driven, Reactive Forms) update their bound values without console or hydration errors
