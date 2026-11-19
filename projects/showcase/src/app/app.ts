import { Component, TemplateRef, ViewChild, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AccordionComponent,
  AccordionTabComponent,
  AccordionTabHeaderDirective,
  AutocompleteComponent,
  AvatarComponent,
  AvatarGroupComponent,
  BadgeComponent,
  BlockUiComponent,
  BreadcrumbComponent,
  BreadcrumbHomeItem,
  BreadcrumbItem,
  ButtonDirective,
  CardComponent,
  CarouselComponent,
  CarouselResponsiveOption,
  CascadeSelectComponent,
  CascadeSelectOption,
  CardFooterDirective,
  CheckboxComponent,
  ChipComponent,
  ColorPickerComponent,
  ConfirmDialogData,
  ConfirmDialogService,
  ConfirmPopupData,
  ConfirmPopupService,
  ContextMenuDirective,
  DIALOG_DATA,
  DIALOG_REF,
  DataTableComponent,
  DataViewComponent,
  DockComponent,
  DatePickerComponent,
  DateRange,
  DialogService,
  DividerComponent,
  DrawerComponent,
  EditorComponent,
  FieldsetComponent,
  FieldsetLegendDirective,
  FileUploadComponent,
  FloatLabelComponent,
  FloatLabelTextDirective,
  GalleriaComponent,
  GalleriaItem,
  GlobalOverlayPosition,
  IconComponent,
  IconFieldComponent,
  IconFieldIconDirective,
  IftaLabelComponent,
  IftaLabelTextDirective,
  ImageCompareComponent,
  ImageComponent,
  KnobComponent,
  InplaceComponent,
  InplaceContentDirective,
  InplaceDisplayDirective,
  InputChipsComponent,
  InputGroupAddonDirective,
  InputGroupComponent,
  InputNumberComponent,
  InputOtpComponent,
  InputTextDirective,
  InlineMessageComponent,
  ListboxComponent,
  MenuComponent,
  MegaMenuComponent,
  MegaMenuItem,
  MenubarComponent,
  MenubarItem,
  MenuItem,
  MenuItemGroup,
  MessageComponent,
  MeterGroupComponent,
  MeterItem,
  MultiSelectComponent,
  OrgChartNode,
  OrganizationChartComponent,
  OverlayBadgeComponent,
  OverlayHandle,
  OverlayService,
  OrderListComponent,
  PaginatorComponent,
  PanelComponent,
  PickListComponent,
  PanelMenuComponent,
  PasswordComponent,
  PopoverComponent,
  RippleDirective,
  SkeletonComponent,
  SpeedDialComponent,
  ProgressBarComponent,
  ProgressSpinnerComponent,
  RadioButtonComponent,
  RatingComponent,
  ScrollPanelComponent,
  SelectButtonComponent,
  SelectComponent,
  SelectOption,
  SliderComponent,
  SliderRange,
  SplitButtonComponent,
  SplitterComponent,
  SplitterGutterComponent,
  SplitterPanelComponent,
  TableColumnComponent,
  StepItem,
  StepPanelComponent,
  StepperComponent,
  StepsComponent,
  TabComponent,
  TabsComponent,
  TabMenuComponent,
  TagComponent,
  TerminalComponent,
  TieredMenuComponent,
  TieredMenuItem,
  TimelineComponent,
  TreeComponent,
  TreeNodeTemplateDirective,
  TreeNode,
  TreeSelectComponent,
  TreeTableComponent,
  TreeTableNode,
  VirtualScrollerComponent,
  TextareaDirective,
  ToastMessage,
  ToastService,
  ToggleButtonComponent,
  ToggleSwitchComponent,
  ToolbarCenterDirective,
  ToolbarComponent,
  ToolbarEndDirective,
  ToolbarStartDirective,
  TooltipDirective,
} from '@medra/ui';

@Component({
  standalone: true,
  imports: [ButtonDirective],
  template: `
    <p>Delete "{{ data.itemName }}"? This can't be undone.</p>
    <div style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1rem;">
      <button medButton type="button" variant="text" severity="secondary" (click)="dialogRef.close(false)">Cancel</button>
      <button medButton type="button" severity="danger" (click)="dialogRef.close(true)">Delete</button>
    </div>
  `,
})
class ConfirmDeleteDialogContent {
  protected readonly dialogRef = inject(DIALOG_REF);
  protected readonly data = inject<{ itemName: string }>(DIALOG_DATA);
}

/** Its constructor only runs once, whenever the lazy tab that wraps it in an <ng-template> is first activated — the mounted-at timestamp proves it never re-mounts on later visits. */
@Component({
  standalone: true,
  selector: 'app-lazy-tab-content',
  template: `<p>Mounted at {{ mountedAt }} — switch away and back, it never changes.</p>`,
})
class LazyTabContent {
  protected readonly mountedAt = new Date().toLocaleTimeString();
}

@Component({
  standalone: true,
  selector: 'app-overlay-demo-panel',
  template: `<div class="rounded-md border border-surface-200 bg-surface-0 p-3 text-sm shadow-overlay-md dark:border-surface-700 dark:bg-surface-900">Anchored overlay content</div>`,
})
class OverlayDemoPanel {}

@Component({
  selector: 'app-root',
  imports: [
    ButtonDirective,
    RippleDirective,
    IconComponent,
    AccordionComponent,
    AccordionTabComponent,
    AccordionTabHeaderDirective,
    ChipComponent,
    FileUploadComponent,
    CheckboxComponent,
    InputTextDirective,
    InputNumberComponent,
    InputChipsComponent,
    InputGroupComponent,
    InputGroupAddonDirective,
    IconFieldComponent,
    IconFieldIconDirective,
    FloatLabelComponent,
    FloatLabelTextDirective,
    IftaLabelComponent,
    IftaLabelTextDirective,
    InputOtpComponent,
    PasswordComponent,
    TextareaDirective,
    RadioButtonComponent,
    MessageComponent,
    InlineMessageComponent,
    TagComponent,
    BadgeComponent,
    DividerComponent,
    SelectComponent,
    ListboxComponent,
    SelectButtonComponent,
    RatingComponent,
    SliderComponent,
    SplitButtonComponent,
    StepsComponent,
    StepperComponent,
    StepPanelComponent,
    MultiSelectComponent,
    AutocompleteComponent,
    CarouselComponent,
    CascadeSelectComponent,
    DataViewComponent,
    ImageComponent,
    DatePickerComponent,
    ProgressBarComponent,
    ProgressSpinnerComponent,
    AvatarComponent,
    AvatarGroupComponent,
    CardComponent,
    CardFooterDirective,
    PanelComponent,
    FieldsetComponent,
    FieldsetLegendDirective,
    DrawerComponent,
    PopoverComponent,
    SkeletonComponent,
    ContextMenuDirective,
    TooltipDirective,
    BreadcrumbComponent,
    PaginatorComponent,
    MenuComponent,
    MenubarComponent,
    TabsComponent,
    TabComponent,
    LazyTabContent,
    ToggleButtonComponent,
    ToggleSwitchComponent,
    ToolbarComponent,
    ToolbarStartDirective,
    ToolbarCenterDirective,
    ToolbarEndDirective,
    TieredMenuComponent,
    MegaMenuComponent,
    PanelMenuComponent,
    SpeedDialComponent,
    ScrollPanelComponent,
    SplitterComponent,
    SplitterPanelComponent,
    SplitterGutterComponent,
    BlockUiComponent,
    InplaceComponent,
    InplaceDisplayDirective,
    InplaceContentDirective,
    MeterGroupComponent,
    OverlayBadgeComponent,
    DataTableComponent,
    TableColumnComponent,
    OrganizationChartComponent,
    KnobComponent,
    TerminalComponent,
    DockComponent,
    ImageCompareComponent,
    GalleriaComponent,
    VirtualScrollerComponent,
    TreeComponent,
  TreeNodeTemplateDirective,
    TreeTableComponent,
    TreeSelectComponent,
    TabMenuComponent,
    PickListComponent,
    OrderListComponent,
    ColorPickerComponent,
    EditorComponent,
    TimelineComponent,
    FormsModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly dialogService = inject(DialogService);
  private readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly confirmPopupService = inject(ConfirmPopupService);
  private readonly toastService = inject(ToastService);
  protected messageClosed = false;
  protected messageLifeVisible = true;

  protected readonly severities = ['primary', 'secondary', 'info', 'success', 'warn', 'help', 'danger', 'contrast'] as const;
  protected readonly variants = ['filled', 'outlined', 'text', 'link'] as const;
  protected checkboxDemoValue = true;
  /** Onda 6, item 5. */
  protected checkboxTrueFalseDemoValue: 'yes' | 'no' = 'no';
  protected readonly checkboxGroupCities = ['NYC', 'SF', 'LA'];
  protected checkboxGroupDemoValue: string[] = ['SF'];
  protected inputDemoValue = '';
  protected inputNumberDemoValue: number | null = 42;
  protected inputNumberButtonsDemoValue: number | null = null;
  protected inputNumberHorizontalDemoValue: number | null = 5;
  protected inputNumberCurrencyDemoValue: number | null = 19.9;
  /** Onda 6, item 9. */
  protected inputNumberVerticalDemoValue: number | null = 5;
  protected inputNumberClearDemoValue: number | null = 7;
  protected passwordDemoValue = '';
  protected passwordToggleDemoValue = '';
  protected passwordClearDemoValue = 'hunter2';
  protected passwordToggleClearDemoValue = 'hunter2';
  protected textareaDemoValue = '';
  protected textareaAutoResizeDemoValue = '';
  protected radioPlan = 'free';
  protected radioSizeDemo = 'sm';
  protected dialogResult = signal<string>('');

  protected readonly fruitOptions: SelectOption<string>[] = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry', value: 'cherry' },
    { label: 'Durian', value: 'durian', disabled: true },
    { label: 'Elderberry', value: 'elderberry' },
  ];
  /** Onda 6, item 1 — grouped options demo (`SelectOption.group`). */
  protected readonly groupedFoodOptions: SelectOption<string>[] = [
    { label: 'Apple', value: 'apple', group: 'Fruits' },
    { label: 'Banana', value: 'banana', group: 'Fruits' },
    { label: 'Cherry', value: 'cherry', group: 'Fruits' },
    { label: 'Carrot', value: 'carrot', group: 'Vegetables' },
    { label: 'Daikon', value: 'daikon', group: 'Vegetables' },
  ];
  /** Onda 6, item 1 — `loading` demo, toggled by a button in the showcase. */
  protected readonly selectLoadingDemo = signal(false);
  protected selectEditableDemoValue: string | null = null;
  protected readonly cascadeOptions: CascadeSelectOption<string>[] = [
    {
      label: 'USA',
      children: [
        {
          label: 'California',
          children: [
            { label: 'Los Angeles', value: 'la' },
            { label: 'San Francisco', value: 'sf' },
          ],
        },
        { label: 'Texas', children: [{ label: 'Austin', value: 'austin' }] },
      ],
    },
    {
      label: 'Canada',
      children: [{ label: 'Ontario', children: [{ label: 'Toronto', value: 'toronto' }, { label: 'Ottawa', value: 'ottawa', disabled: true }] }],
    },
  ];
  protected cascadeDemoValue: string | null = null;
  protected cascadeClearDemoValue: string | null = 'la';
  protected cascadeMobileDemoValue: string | null = null;

  protected selectDemoValue: string | null = null;
  protected listboxDemoValue: string | null = null;
  protected listboxMultipleDemoValue: string[] = [];
  protected listboxToggleAllDemoValue: string[] = [];

  protected readonly listboxDragDropOptions = signal<SelectOption<string>[]>([...this.fruitOptions]);
  protected readonly listboxDragDropOrderLabel = computed(() => this.listboxDragDropOptions().map((o) => o.label).join(', '));

  protected onListboxReorder(event: { previousIndex: number; currentIndex: number; options: readonly SelectOption<string>[] }): void {
    this.listboxDragDropOptions.set([...event.options]);
  }
  protected selectFilterDemoValue: string | null = null;
  protected multiSelectDemoValue: string[] = [];
  protected multiSelectChipDemoValue: string[] = ['apple', 'banana'];
  protected multiSelectLimitDemoValue: string[] = [];

  // Perf smoke test for CdkVirtualScrollViewport in SelectPanelComponent — not
  // a realistic dataset, just enough volume (12k) to notice jank if the
  // panel ever stops virtualizing rows.
  protected readonly bigListOptions: SelectOption<number>[] = Array.from({ length: 12_000 }, (_, i) => ({
    label: `Option #${i + 1}`,
    value: i,
  }));
  protected bigSelectDemoValue: number | null = null;
  protected bigMultiSelectDemoValue: number[] = [];

  /** Onda 6, item 17 — `lazy`/`lazyLoad` demo: starts with a small slice of `bigListOptions`, appended to as the user scrolls near the end. */
  protected readonly lazySelectOptions = signal<SelectOption<number>[]>(this.bigListOptions.slice(0, 20));
  protected selectLazyDemoValue: number | null = null;

  protected onSelectLazyLoad(range: { first: number; last: number }): void {
    const loaded = this.lazySelectOptions();
    if (range.last < loaded.length - 5 || loaded.length >= this.bigListOptions.length) {
      return; // not close enough to the end yet, or already fully loaded
    }
    this.lazySelectOptions.set([...loaded, ...this.bigListOptions.slice(loaded.length, loaded.length + 20)]);
  }

  // Simulates a real (debounced, server-backed) search: `loading` flips on
  // immediately when (search) fires, and `suggestions` only arrives ~400ms
  // later — enough delay to see the spinner in the trailing slot for real.
  protected autocompleteSuggestions: SelectOption<string>[] = [];
  protected autocompleteLoading = signal(false);
  protected autocompleteDemoValue: SelectOption<string> | null = null;
  protected autocompleteMultiDemoValue: SelectOption<string>[] = [];
  protected autocompleteDropdownDemoValue: SelectOption<string> | null = null;

  protected onFruitSearch(query: string): void {
    this.autocompleteLoading.set(true);
    setTimeout(() => {
      this.autocompleteSuggestions = this.fruitOptions.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()));
      this.autocompleteLoading.set(false);
    }, 400);
  }

  protected datePickerDemoValue: Date | null = null;
  protected datePickerRangeDemoValue: DateRange = { start: null, end: null };
  protected datePickerDrilldownDemoValue: Date | null = null;
  protected datePickerDrilldownRangeDemoValue: DateRange = { start: null, end: null };
  protected readonly datePickerMinDate = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
  protected readonly datePickerMaxDate = new Date(new Date().getFullYear(), new Date().getMonth() + 2, 0);
  // No weekends, plus a couple of specific "holiday" dates in the current month.
  protected readonly datePickerDisabledDays = [0, 6];
  protected readonly datePickerDisabledDates = [
    new Date(new Date().getFullYear(), new Date().getMonth(), 10),
    new Date(new Date().getFullYear(), new Date().getMonth(), 20),
  ];
  protected datePickerDisabledDaysDemoValue: Date | null = null;
  protected readonly datePickerNoMondaysDisabledDays = [1];
  protected datePickerNoMondaysDemoValue: Date | null = null;
  protected datePickerRangeThreeMonthDemoValue: DateRange = { start: null, end: null };
  protected datePickerTimeDemoValue: Date | null = null;
  protected datePickerTime12DemoValue: Date | null = null;
  protected datePickerMultipleDemoValue: readonly Date[] = [];
  protected datePickerMonthViewDemoValue: Date | null = null;
  protected datePickerMonthViewDrilldownDemoValue: Date | null = null;

  protected progressDemoValue = 40;
  protected panelCollapsed = false;
  protected fieldsetCollapsed = false;
  protected fieldsetEventsCollapsed = false;
  protected fieldsetEventsLog: string[] = [];

  protected logFieldsetBeforeToggle(collapsed: boolean): void {
    this.fieldsetEventsLog = [...this.fieldsetEventsLog, `beforeToggle: collapsed was ${collapsed}`];
  }

  protected logFieldsetAfterToggle(collapsed: boolean): void {
    this.fieldsetEventsLog = [...this.fieldsetEventsLog, `afterToggle: collapsed is now ${collapsed}`];
  }

  protected drawerLeftOpen = false;
  protected drawerRightOpen = false;
  protected drawerTopOpen = false;
  protected drawerBottomOpen = false;
  protected drawerNonModalOpen = false;
  protected drawerFullScreenOpen = false;
  protected drawerHeaderFooterOpen = false;
  protected drawerHeadlessOpen = false;

  protected skeletonLoading = true;

  protected readonly contextMenuItems: TieredMenuItem[] = [
    { label: 'Rename', icon: 'pencil', command: () => this.contextMenuLog.set('Rename clicked') },
    { label: 'Duplicate', icon: 'document-duplicate', command: () => this.contextMenuLog.set('Duplicate clicked') },
    {
      label: 'Export as',
      items: [
        { label: 'PDF', command: () => this.contextMenuLog.set('Export as PDF clicked') },
        { label: 'CSV', command: () => this.contextMenuLog.set('Export as CSV clicked') },
      ],
    },
    { separator: true },
    { label: 'Archive', icon: 'archive-box', disabled: true },
    { label: 'Delete', icon: 'trash', command: () => this.contextMenuLog.set('Delete clicked') },
  ];
  protected contextMenuLog = signal('(none yet)');
  protected contextMenuGlobal = signal(false);

  protected accordionActiveIndex: number | null = 0;
  protected accordionMultipleActiveIndices: readonly number[] = [0];
  protected accordionEventsLog: string[] = [];

  protected readonly chipAvatarImage =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><rect width="24" height="24" rx="12" fill="%236366f1"/></svg>';
  protected chipSkills = ['Angular', 'TypeScript', 'Tailwind CSS', 'RxJS'];

  protected removeChipSkill(skill: string): void {
    this.chipSkills = this.chipSkills.filter((s) => s !== skill);
  }

  protected inputChipsDemoValue: string[] = ['Angular', 'TypeScript'];
  protected inputChipsMaxDemoValue: string[] = [];
  /** Onda 6, item 8. */
  protected inputChipsAddOnTabDemoValue: string[] = [];

  protected readonly dataTableProducts = [
    { name: 'Widget', category: 'Hardware', price: 29.99, stock: 42 },
    { name: 'Gadget', category: 'Electronics', price: 9.99, stock: 0 },
    { name: 'Gizmo', category: 'Electronics', price: 19.5, stock: 12 },
    { name: 'Doohickey', category: 'Hardware', price: 45.0, stock: 3 },
    { name: 'Thingamajig', category: 'Misc', price: 5.25, stock: 108 },
    { name: 'Contraption', category: 'Hardware', price: 120.0, stock: 7 },
    { name: 'Whatsit', category: 'Misc', price: 2.5, stock: 0 },
  ];
  protected dataTableSelection: { name: string; category: string; price: number; stock: number }[] = [];
  protected dataTableSingleSelection: { name: string; category: string; price: number; stock: number } | null = null;

  protected readonly dataTableEditableProducts = signal(this.dataTableProducts.map((p) => ({ ...p })));
  protected readonly dataTableEditableSelection = signal<{ name: string; category: string; price: number; stock: number }[]>([]);
  protected readonly dataTableMultiSortMeta = signal<{ field: string; order: 'asc' | 'desc' | null }[]>([]);
  protected readonly dataTableLoading = signal(false);

  protected onDataTableEditComplete(event: { row: { name: string; category: string; price: number; stock: number }; field: string; value: unknown }): void {
    this.dataTableEditableProducts.update((rows) => rows.map((row) => (row === event.row ? { ...row, [event.field]: event.value } : row)));
  }

  protected simulateDataTableLoading(): void {
    this.dataTableLoading.set(true);
    setTimeout(() => this.dataTableLoading.set(false), 1200);
  }

  // Simulates a server-side data source: DataTable's own lazy input never
  // touches this array directly, it only trusts value()/totalRecords() and
  // asks (via lazyLoad) for whatever page/sort/filter it needs next.
  private readonly dataTableLazyServerRows = Array.from({ length: 83 }, (_, i) => ({ name: `Customer ${i + 1}`, plan: i % 3 === 0 ? 'Pro' : 'Free' }));
  protected readonly dataTableLazyRows = signal<{ name: string; plan: string }[]>([]);
  protected readonly dataTableLazyLoading = signal(false);

  protected onDataTableLazyLoad(event: { first: number; rows: number; sortField: string | null; sortOrder: 'asc' | 'desc' | null }): void {
    this.dataTableLazyLoading.set(true);
    setTimeout(() => {
      let rows = [...this.dataTableLazyServerRows];
      if (event.sortField && event.sortOrder) {
        const field = event.sortField as 'name' | 'plan';
        rows.sort((a, b) => (a[field] < b[field] ? -1 : a[field] > b[field] ? 1 : 0));
        if (event.sortOrder === 'desc') {
          rows.reverse();
        }
      }
      this.dataTableLazyRows.set(rows.slice(event.first, event.first + event.rows));
      this.dataTableLazyLoading.set(false);
    }, 400);
  }

  protected readonly dataTableGroupedProducts = this.dataTableProducts;

  protected readonly dataTableReorderRows = signal(this.dataTableProducts.map((p) => ({ ...p })));
  protected dataTableLastReorder = '(none yet)';
  protected dataTableReorderSelection: { name: string; category: string; price: number; stock: number }[] = [];

  protected onDataTableRowReorder(event: { dragIndex: number; dropIndex: number }): void {
    this.dataTableReorderRows.update((rows) => {
      const next = [...rows];
      const [moved] = next.splice(event.dragIndex, 1);
      next.splice(event.dropIndex, 0, moved);
      return next;
    });
    this.dataTableLastReorder = `dragIndex ${event.dragIndex} -> dropIndex ${event.dropIndex}`;
  }

  // dataKey demo: reloading swaps in a brand-new array of otherwise-equal
  // objects (different references) — selection tracked by dataKey should
  // survive that; reference-based selection would silently lose it.
  protected reloadDataTableReorderRows(): void {
    this.dataTableReorderRows.set(this.dataTableProducts.map((p) => ({ ...p })));
  }

  protected readonly dataViewProducts = [
    { name: 'Widget', price: 30 },
    { name: 'Gadget', price: 10 },
    { name: 'Gizmo', price: 20 },
    { name: 'Doohickey', price: 45 },
    { name: 'Thingamajig', price: 5 },
  ];
  protected dataViewLayout: 'list' | 'grid' = 'list';
  protected readonly dataViewSortByPrice = (a: { price: number }, b: { price: number }) => a.price - b.price;
  protected readonly dataViewFilterByName = (item: { name: string }, query: string) => item.name.toLowerCase().includes(query.toLowerCase());
  protected dataViewLoading = false;

  protected readonly imageDemoSrc =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160"><rect width="240" height="160" fill="%236366f1"/><text x="120" y="85" font-size="20" fill="white" text-anchor="middle" font-family="sans-serif">Preview me</text></svg>';
  protected readonly imageBrokenSrc = '/does-not-exist.png';
  protected readonly imagePreviewStatus = signal('closed (never opened)');
  protected readonly imageErrorStatus = signal('no error yet');

  protected readonly checkoutSteps: StepItem[] = [{ label: 'Cart' }, { label: 'Shipping' }, { label: 'Payment' }, { label: 'Confirm' }];
  protected stepsActiveIndex = 1;

  protected stepperResult = signal('(not finished)');
  protected onStepperCompleted(): void {
    this.stepperResult.set('Order placed!');
  }

  protected readonly carouselImages = [
    { color: '#6366f1', label: 'Slide 1' },
    { color: '#ec4899', label: 'Slide 2' },
    { color: '#22c55e', label: 'Slide 3' },
    { color: '#f59e0b', label: 'Slide 4' },
    { color: '#0ea5e9', label: 'Slide 5' },
  ];
  protected readonly carouselResponsiveOptions: CarouselResponsiveOption[] = [
    { breakpoint: '1024px', numVisible: 3, numScroll: 3 },
    { breakpoint: '768px', numVisible: 2, numScroll: 2 },
    { breakpoint: '480px', numVisible: 1, numScroll: 1 },
  ];
  protected readonly carouselVerticalPage = signal(0);

  protected fileUploadDemoValue: File[] = [];
  protected fileUploadImagesDemoValue: File[] = [];
  protected fileUploadRealDemoValue: File[] = [];

  protected toggleSwitchDemoValue = false;
  protected toggleSwitchSizeDemo = true;

  protected toggleButtonDemoValue = false;
  protected toggleButtonLockDemoValue = true;

  protected readonly sizeOptions: SelectOption<string>[] = [
    { label: 'Small', value: 'sm' },
    { label: 'Medium', value: 'md', disabled: true },
    { label: 'Large', value: 'lg' },
  ];
  protected selectButtonDemoValue: string | null = null;
  protected selectButtonMultipleDemoValue: string[] = [];
  protected selectButtonNoEmptyDemoValue: string | null = 'sm';

  protected ratingDemoValue: number | null = 3;
  protected ratingNoCancelDemoValue: number | null = 2;
  protected ratingReadonlyDemoValue = 4;
  protected ratingHalfDemoValue: number | null = 2.5;
  protected ratingHalfReadonlyDemoValue = 3.5;

  protected sliderDemoValue = 40;
  protected sliderStepDemoValue = 20;
  protected sliderRangeDemoValue: SliderRange = { start: 20, end: 70 };
  protected sliderMinGapDemoValue: SliderRange = { start: 20, end: 70 };
  protected sliderDisabledMinDemoValue: SliderRange = { start: 20, end: 70 };

  protected readonly splitButtonItems: MenuItem[] = [
    { label: 'Save as...', icon: 'document-duplicate', command: () => this.splitButtonLog.set('Save as... clicked') },
    { label: 'Save a copy', command: () => this.splitButtonLog.set('Save a copy clicked') },
    { separator: true },
    { label: 'Export', disabled: true },
  ];
  protected splitButtonLog = signal('(none yet)');

  protected readonly breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Projects', url: '/projects' },
    { label: 'Archived', url: '/projects/archived', visible: false },
    { label: 'External docs', url: 'https://example.com', target: '_blank' },
    { label: 'MedraUi' },
  ];
  protected readonly breadcrumbHome: BreadcrumbHomeItem = { url: '/' };

  protected paginatorFirst = 0;
  protected paginatorRows = 10;
  protected paginatorFirst2 = 0;

  @ViewChild(MenuComponent) protected fileMenu!: MenuComponent;
  protected readonly fileMenuItems: MenuItem[] = [
    { label: 'Rename', icon: 'pencil', command: () => this.menuLog.set('Rename clicked') },
    { label: 'Duplicate', icon: 'document-duplicate', command: () => this.menuLog.set('Duplicate clicked') },
    { separator: true },
    { label: 'Archive', icon: 'archive-box', disabled: true },
    { label: 'Delete', icon: 'trash', command: () => this.menuLog.set('Delete clicked') },
    { separator: true },
    { label: 'Docs', url: 'https://example.com/docs', target: '_blank', badge: 'New' },
  ];
  protected readonly cdnMenuItems: MenuItem[] = [
    { label: 'Profile', icon: 'fa-solid fa-user' },
    { label: 'Settings', icon: 'fa-solid fa-gear' },
  ];
  protected menuLog = signal('(none yet)');
  protected readonly groupedMenuItems: MenuItemGroup[] = [
    {
      label: 'File',
      items: [
        { label: 'Rename', icon: 'pencil', command: () => this.menuLog.set('Rename clicked') },
        { label: 'Delete', icon: 'trash', command: () => this.menuLog.set('Delete clicked') },
      ],
    },
    {
      label: 'Edit',
      items: [
        { label: 'Undo', command: () => this.menuLog.set('Undo clicked') },
        { label: 'Redo', disabled: true },
      ],
    },
  ];

  @ViewChild(TieredMenuComponent) protected tieredMenu!: TieredMenuComponent;
  protected readonly tieredMenuItems: TieredMenuItem[] = [
    {
      label: 'File',
      icon: 'document-duplicate',
      items: [
        { label: 'New', command: () => this.tieredMenuLog.set('New clicked') },
        {
          label: 'Open recent',
          items: [
            { label: 'invoice-042.pdf', command: () => this.tieredMenuLog.set('Opened invoice-042.pdf') },
            { label: 'report.docx', command: () => this.tieredMenuLog.set('Opened report.docx') },
          ],
        },
        { separator: true },
        { label: 'Delete', icon: 'trash', command: () => this.tieredMenuLog.set('Delete clicked') },
      ],
    },
    { label: 'Edit', items: [{ label: 'Undo' }, { label: 'Redo' }] },
    { label: 'Docs', url: 'https://example.com/docs', target: '_blank', badge: 'New' },
    { label: 'Disabled', disabled: true },
  ];
  protected tieredMenuLog = signal('(none yet)');

  protected readonly megaMenuItems: MegaMenuItem[] = [
    {
      label: 'Products',
      columns: [
        {
          header: 'Computers',
          items: [
            { label: 'Laptops', command: () => this.megaMenuLog.set('Laptops clicked') },
            { label: 'Desktops', command: () => this.megaMenuLog.set('Desktops clicked') },
          ],
        },
        {
          header: 'Accessories',
          items: [
            { label: 'Keyboards', command: () => this.megaMenuLog.set('Keyboards clicked') },
            { label: 'Mice', disabled: true },
          ],
        },
      ],
    },
    { label: 'About', command: () => this.megaMenuLog.set('About clicked') },
    { label: 'Docs', url: 'https://example.com/docs', target: '_blank' },
  ];
  protected megaMenuLog = signal('(none yet)');

  protected readonly panelMenuItems: TieredMenuItem[] = [
    {
      label: 'Documents',
      items: [
        { label: 'Invoices', command: () => this.panelMenuLog.set('Invoices clicked') },
        {
          label: 'Reports',
          items: [
            { label: 'Q1 report', command: () => this.panelMenuLog.set('Q1 report clicked') },
            { label: 'Q2 report', command: () => this.panelMenuLog.set('Q2 report clicked') },
          ],
        },
        { separator: true },
        { label: 'Trash', disabled: true },
      ],
    },
    { label: 'Settings', command: () => this.panelMenuLog.set('Settings clicked') },
    { label: 'Docs', url: 'https://example.com/docs', target: '_blank', badge: 'New' },
  ];
  protected panelMenuLog = signal('(none yet)');

  protected readonly speedDialItems: MenuItem[] = [
    { label: 'Add', icon: 'plus', command: () => this.speedDialLog.set('Add clicked') },
    { label: 'Edit', icon: 'pencil', command: () => this.speedDialLog.set('Edit clicked') },
    { label: 'Delete', icon: 'trash', disabled: true },
  ];
  protected speedDialLog = signal('(none yet)');

  protected floatLabelDemoValue = '';
  protected iftaLabelDemoValue = '';

  protected inputOtpDemoValue = '';
  protected inputOtpMaskedDemoValue = '';

  protected readonly menubarItems: MenubarItem[] = [
    { label: 'Home', command: () => this.menubarLog.set('Home clicked') },
    {
      label: 'Edit',
      items: [
        { label: 'Rename', command: () => this.menubarLog.set('Edit > Rename clicked') },
        { label: 'Delete', command: () => this.menubarLog.set('Edit > Delete clicked') },
      ],
    },
    {
      label: 'View',
      items: [{ label: 'Zoom in' }, { label: 'Zoom out' }],
    },
    { label: 'Docs', url: 'https://example.com/docs', target: '_blank', badge: 'New' },
  ];
  protected menubarLog = signal('(none yet)');

  protected readonly scrollPanelLines = Array.from({ length: 20 }, (_, i) => `v0.${20 - i}.0 — release notes go here.`);

  protected splitterSizes: readonly number[] | null = [30, 70];

  protected inplaceDemoValue = 'Jane Doe';
  protected inplaceClosableDemoValue = 'A short bio goes here.';

  protected readonly orgChartValue: OrgChartNode = {
    label: 'CEO',
    children: [
      {
        label: 'CTO',
        children: [{ label: 'Engineering' }, { label: 'QA' }],
      },
      {
        label: 'CFO',
        children: [{ label: 'Accounting' }],
      },
      { label: 'Vacant', selectable: false },
    ],
  };
  protected orgChartSelection: OrgChartNode | null = null;
  protected orgChartCheckboxSelection: readonly OrgChartNode[] = [];
  protected readonly orgChartLastToggle = signal('(none yet)');

  protected onOrgChartNodeExpand(node: OrgChartNode): void {
    this.orgChartLastToggle.set(`expanded: ${node.label}`);
  }

  protected onOrgChartNodeCollapse(node: OrgChartNode): void {
    this.orgChartLastToggle.set(`collapsed: ${node.label}`);
  }

  protected knobDemoValue = 60;
  protected knobBrightnessDemoValue = 7;
  protected knobReadonlyDemoValue = 35;
  protected knobDisabledDemoValue = 20;
  /** Onda 6, item 10. */
  protected knobCustomColorDemoValue = 65;
  protected knobTemplateDemoValue = 42;
  protected readonly knobPercentTemplate = (value: number) => `${value}%`;

  protected readonly virtualScrollerItems = Array.from({ length: 50_000 }, (_, i) => ({ name: `Row ${i + 1}` }));
  @ViewChild(VirtualScrollerComponent) protected virtualScroller!: VirtualScrollerComponent<{ name: string }>;
  protected readonly virtualScrollerRange = signal('not scrolled yet');

  protected scrollVirtualScrollerToRow500(): void {
    this.virtualScroller.scrollToIndex(500, 'smooth');
  }

  // Plain fields mutated from a setTimeout callback never update the view in
  // a zoneless app (no Zone.js to notice the timer and schedule change
  // detection) — signals are what actually make an async update like this
  // one visible.
  protected readonly lazyScrollItems = signal<{ name: string }[]>(Array.from({ length: 40 }, (_, i) => ({ name: `Lazy row ${i + 1}` })));
  protected readonly lazyScrollLoading = signal(false);

  protected onLazyScrollerLoad(range: { first: number; last: number }): void {
    if (this.lazyScrollLoading() || this.lazyScrollItems().length >= 500) {
      return;
    }
    this.lazyScrollLoading.set(true);
    setTimeout(() => {
      const more = Array.from({ length: range.last - range.first }, (_, i) => ({ name: `Lazy row ${range.first + i + 1}` }));
      this.lazyScrollItems.update((current) => [...current, ...more]);
      this.lazyScrollLoading.set(false);
    }, 500);
  }

  protected readonly treeNodes: TreeNode[] = [
    {
      label: 'Documents',
      icon: 'folder',
      children: [
        { label: 'Resume.pdf', icon: 'document-duplicate' },
        { label: 'Invoice.pdf', icon: 'document-duplicate' },
      ],
    },
    {
      label: 'Photos',
      icon: 'folder',
      children: [{ label: 'Vacation', icon: 'folder', children: [{ label: 'beach.jpg', icon: 'photo' }] }],
    },
    { label: 'README.md', icon: 'document-duplicate' },
  ];
  protected treeSingleSelection: TreeNode | null = null;
  protected treeCheckboxSelection: TreeNode[] = [];
  protected treeFilterableSelection: TreeNode | null = null;
  protected readonly treeVirtualScrollNodes: TreeNode[] = Array.from({ length: 5_000 }, (_, i) => ({ label: `Node ${i + 1}` }));
  protected readonly treeTypedNodes: TreeNode[] = [
    {
      label: 'Documents',
      type: 'folder',
      children: [
        { label: 'Resume.pdf', type: 'file' },
        { label: 'Invoice.pdf', type: 'file' },
      ],
    },
    { label: 'Photos', type: 'folder', children: [{ label: 'beach.jpg', type: 'file' }] },
  ];
  protected treeVirtualScrollSelection: TreeNode | null = null;
  protected treeSelectDemoValue: TreeNode | null = null;

  protected readonly tabMenuItems: MenuItem[] = [
    { label: 'Home' },
    { label: 'Reports' },
    { label: 'Disabled', disabled: true },
    { label: 'Settings' },
    { label: 'Docs', url: 'https://example.com/docs', target: '_blank', badge: 'New' },
  ];
  protected tabMenuActiveIndex = 0;

  protected pickListSource = ['Apple', 'Banana', 'Cherry', 'Durian', 'Elderberry'];
  protected pickListTarget: string[] = [];
  protected pickListExtSource = ['Apple', 'Banana (locked)', 'Cherry', 'Durian', 'Elderberry'];
  protected pickListExtTarget: string[] = [];
  protected readonly pickListFilterPredicate = (item: string, query: string) => item.toLowerCase().includes(query.toLowerCase());
  protected readonly pickListItemDisabled = (item: string) => item.includes('locked');
  protected readonly pickListLastEvent = signal('(none yet)');

  protected onPickListMoveToTarget(items: readonly string[]): void {
    this.pickListLastEvent.set(`moveToTarget: ${items.join(', ')}`);
  }

  protected onPickListMoveAllToTarget(items: readonly string[]): void {
    this.pickListLastEvent.set(`moveAllToTarget: ${items.join(', ')}`);
  }

  protected onPickListMoveToSource(items: readonly string[]): void {
    this.pickListLastEvent.set(`moveToSource: ${items.join(', ')}`);
  }

  protected onPickListMoveAllToSource(items: readonly string[]): void {
    this.pickListLastEvent.set(`moveAllToSource: ${items.join(', ')}`);
  }

  protected orderListValue = ['Apple', 'Banana', 'Cherry', 'Durian', 'Elderberry'];
  protected orderListSelection: string[] = [];
  protected orderListDisabled = false;

  protected colorPickerValue = '#3b82f6';
  protected colorPickerDisabledValue = '#000000';
  /** Onda 6, item 6. */
  protected colorPickerRgbValue = 'rgb(16, 185, 129)';
  protected colorPickerInlineValue = '#f59e0b';

  protected editorValue = '<p>Hello <strong>world</strong>! Try formatting this text.</p>';

  protected readonly timelineEvents = [
    { title: 'Order placed', date: 'Jan 10', description: 'Your order has been received.' },
    { title: 'Shipped', date: 'Jan 12', description: 'Package left the warehouse.' },
    { title: 'Out for delivery', date: 'Jan 14', description: 'Courier is on the way.' },
    { title: 'Delivered', date: 'Jan 15', description: 'Package delivered to the front door.' },
  ];

  protected readonly treeTableValue: TreeTableNode<{ name: string; role: string }>[] = [
    {
      data: { name: 'Alice', role: 'CEO' },
      children: [
        { data: { name: 'Bob', role: 'CTO' }, children: [{ data: { name: 'Carol', role: 'Engineer' } }] },
        { data: { name: 'Dave', role: 'CFO' } },
      ],
    },
    { data: { name: 'Erin', role: 'Advisor' } },
  ];
  protected readonly treeTableVirtualValue: TreeTableNode<{ name: string; role: string }>[] = Array.from({ length: 3_000 }, (_, i) => ({
    data: { name: `Employee ${i + 1}`, role: i % 7 === 0 ? 'Manager' : 'Staff' },
  }));
  protected readonly treeTableEditableValue: TreeTableNode<{ name: string; role: string; department: string; location: string }>[] = [
    { data: { name: 'Alice', role: 'CEO', department: 'Executive', location: 'NYC' } },
    { data: { name: 'Bob', role: 'CTO', department: 'Engineering', location: 'SF' } },
    { data: { name: 'Carol', role: 'Engineer', department: 'Engineering', location: 'Remote' } },
  ];
  protected readonly treeTableLastEdit = signal('(none yet)');

  protected onTreeTableEditComplete(event: { node: TreeTableNode<{ name: string }>; field: string; value: unknown }): void {
    this.treeTableLastEdit.set(`${event.node.data.name}.${event.field} = ${event.value}`);
  }

  protected readonly galleriaItems: GalleriaItem[] = ['#6366f1', '#ec4899', '#22c55e', '#f59e0b'].map((color, i) => ({
    src: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320"><rect width="480" height="320" fill="${encodeURIComponent(color)}"/><text x="240" y="170" font-size="28" fill="white" text-anchor="middle" font-family="sans-serif">Photo ${i + 1}</text></svg>`,
    thumbnailSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="${encodeURIComponent(color)}"/></svg>`,
    alt: `Photo ${i + 1}`,
  }));

  // Label centered in the left/right half (not the full 400px canvas) — med-image-compare
  // clips beforeSrc to the left `position`% and shows afterSrc full-width behind it, so at
  // the default 50% position each label needs to sit inside its own visible half, not the
  // shared boundary at x=200, or it renders cut in half.
  protected readonly imageCompareBeforeSrc =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260"><rect width="400" height="260" fill="%2364748b"/><text x="100" y="135" font-size="24" fill="white" text-anchor="middle" font-family="sans-serif">Before</text></svg>';
  protected readonly imageCompareAfterSrc =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260"><rect width="400" height="260" fill="%236366f1"/><text x="300" y="135" font-size="24" fill="white" text-anchor="middle" font-family="sans-serif">After</text></svg>';
  protected imageCompareDemoPosition = 50;

  protected readonly dockLog = signal('(none yet)');
  protected readonly dockItems: MenuItem[] = [
    { label: 'Notifications', icon: 'bell', command: () => this.dockLog.set('Notifications') },
    { label: 'Favorites', icon: 'star', command: () => this.dockLog.set('Favorites') },
    { label: 'Photos', icon: 'photo', command: () => this.dockLog.set('Photos') },
    { label: 'Uploads', icon: 'cloud-arrow-up', command: () => this.dockLog.set('Uploads') },
    { label: 'Locked', icon: 'lock-closed', disabled: true },
    { label: 'Trash', icon: 'trash', command: () => this.dockLog.set('Trash') },
  ];

  protected onTerminalCommand(command: string, terminal: TerminalComponent): void {
    const [name] = command.trim().split(/\s+/);
    switch (name.toLowerCase()) {
      case 'help':
        terminal.respond('Available commands: help, date, clear');
        break;
      case 'date':
        terminal.respond(new Date().toString());
        break;
      case 'clear':
        terminal.clear();
        break;
      default:
        terminal.respond(`Command not found: ${name}`);
    }
  }

  protected readonly meterGroupItems: MeterItem[] = [
    { label: 'Documents', value: 40, severity: 'info', icon: 'document-duplicate' },
    { label: 'Photos', value: 96, severity: 'success' },
    { label: 'Apps', value: 30, severity: 'warn' },
    { label: 'Other', value: 20, severity: 'help' },
  ];

  protected readonly blockUiBlocked = signal(false);
  protected toggleBlockUi(): void {
    if (this.blockUiBlocked()) {
      this.blockUiBlocked.set(false);
      return;
    }
    this.blockUiBlocked.set(true);
    setTimeout(() => this.blockUiBlocked.set(false), 1500);
  }

  protected readonly blockUiTargetBlocked = signal(false);
  protected toggleBlockUiTarget(): void {
    if (this.blockUiTargetBlocked()) {
      this.blockUiTargetBlocked.set(false);
      return;
    }
    this.blockUiTargetBlocked.set(true);
    setTimeout(() => this.blockUiTargetBlocked.set(false), 1500);
  }

  // Real dark mode strategy (class on the root element, per roadmap/decisoes-produto.md
  // Phase 2) — matters for the showcase itself: disabled-state opacity, shadows,
  // etc. only look right against a themed surface background, not plain white.
  protected readonly darkMode = signal(false);

  protected toggleDarkMode(): void {
    this.darkMode.update((value) => !value);
    document.documentElement.classList.toggle('dark', this.darkMode());
  }

  protected openConfirmDialog(): void {
    const ref = this.dialogService.open<ConfirmDeleteDialogContent, boolean>(ConfirmDeleteDialogContent, {
      header: 'Confirm deletion',
      closeLabel: 'Fechar',
      data: { itemName: 'invoice-042.pdf' },
    });
    ref.closed$.subscribe((confirmed) => {
      this.dialogResult.set(confirmed === undefined ? 'dismissed (Esc/backdrop)' : confirmed ? 'confirmed delete' : 'cancelled');
    });
  }

  protected openDraggableResizableDialog(): void {
    const ref = this.dialogService.open<ConfirmDeleteDialogContent, boolean>(ConfirmDeleteDialogContent, {
      header: 'Drag the header, resize the corner, or maximize',
      data: { itemName: 'invoice-042.pdf' },
      draggable: true,
      resizable: true,
      maximizable: true,
    });
    ref.closed$.subscribe((confirmed) => {
      this.dialogResult.set(confirmed === undefined ? 'dismissed (Esc/backdrop)' : confirmed ? 'confirmed delete' : 'cancelled');
    });
  }

  protected openBottomLeftDialog(): void {
    const ref = this.dialogService.open<ConfirmDeleteDialogContent, boolean>(ConfirmDeleteDialogContent, {
      header: 'Anchored to the bottom-left corner',
      data: { itemName: 'invoice-042.pdf' },
      position: 'bottom-left',
    });
    ref.closed$.subscribe((confirmed) => {
      this.dialogResult.set(confirmed === undefined ? 'dismissed (Esc/backdrop)' : confirmed ? 'confirmed delete' : 'cancelled');
    });
  }

  protected openStrictBreakpointDialog(): void {
    const ref = this.dialogService.open<ConfirmDeleteDialogContent, boolean>(ConfirmDeleteDialogContent, {
      header: 'closeOnEscape=false, dismissableMask=false, breakpoints',
      data: { itemName: 'invoice-042.pdf' },
      closeOnEscape: false,
      dismissableMask: false,
      breakpoints: { '960px': '75vw', '640px': '95vw' },
    });
    ref.opened$.subscribe(() => this.dialogResult.set('opened$ fired — use the Cancel/Confirm buttons or the header close, Esc/backdrop are disabled'));
    ref.closed$.subscribe((confirmed) => {
      this.dialogResult.set(confirmed === undefined ? 'dismissed (Esc/backdrop)' : confirmed ? 'confirmed delete' : 'cancelled');
    });
  }

  protected readonly confirmDialogResult = signal('');
  @ViewChild('confirmDialogHeadlessTpl')
  protected confirmDialogHeadlessTpl!: TemplateRef<{ $implicit: ConfirmDialogData; onAccept: () => void; onReject: () => void }>;

  protected openConfirmDialogDelete(): void {
    const ref = this.confirmDialogService.confirm({
      header: 'Delete invoice-042.pdf?',
      message: "This can't be undone.",
      severity: 'danger',
      acceptLabel: 'Delete',
    });
    ref.closed$.subscribe((confirmed) => {
      this.confirmDialogResult.set(confirmed === undefined ? 'dismissed (Esc/backdrop)' : confirmed ? 'accepted delete' : 'rejected');
    });
  }

  protected openConfirmDialogLogout(): void {
    const ref = this.confirmDialogService.confirm({
      message: 'You will need to sign in again on this device.',
    });
    ref.closed$.subscribe((confirmed) => {
      this.confirmDialogResult.set(confirmed === undefined ? 'dismissed (Esc/backdrop)' : confirmed ? 'accepted logout' : 'rejected');
    });
  }

  protected openConfirmDialogAcknowledge(): void {
    const ref = this.confirmDialogService.confirm({
      header: 'Heads up',
      message: 'This report is read-only.',
      severity: 'info',
      acceptLabel: 'Got it',
      rejectVisible: false,
      defaultFocus: 'close',
      position: 'top',
      draggable: true,
    });
    ref.closed$.subscribe((confirmed) => {
      this.confirmDialogResult.set(confirmed === undefined ? 'dismissed (Esc/backdrop/close)' : 'acknowledged');
    });
  }

  protected openConfirmDialogHeadless(): void {
    const ref = this.confirmDialogService.confirm({
      message: 'Enjoying MedraUi so far?',
      headlessTemplate: this.confirmDialogHeadlessTpl,
    });
    ref.closed$.subscribe((confirmed) => {
      this.confirmDialogResult.set(confirmed === undefined ? 'dismissed (Esc/backdrop)' : confirmed ? 'accepted (rate now)' : 'rejected (maybe later)');
    });
  }

  protected readonly confirmPopupResult = signal('');
  @ViewChild('confirmPopupHeadlessTpl')
  protected confirmPopupHeadlessTpl!: TemplateRef<{ $implicit: ConfirmPopupData; onAccept: () => void; onReject: () => void }>;

  protected openConfirmPopupDelete(event: MouseEvent): void {
    const handle = this.confirmPopupService.confirm(event.currentTarget as HTMLElement, {
      message: 'Delete this row?',
      severity: 'danger',
      acceptLabel: 'Delete',
    });
    handle?.closed$.subscribe((confirmed) => {
      this.confirmPopupResult.set(confirmed === undefined ? 'dismissed (Esc/outside click)' : confirmed ? 'accepted delete' : 'rejected');
    });
  }

  protected openConfirmPopupAcknowledge(event: MouseEvent): void {
    const handle = this.confirmPopupService.confirm(event.currentTarget as HTMLElement, {
      message: 'Your changes were saved.',
      severity: 'success',
      acceptLabel: 'OK',
      rejectVisible: false,
      defaultFocus: 'accept',
    });
    handle?.closed$.subscribe((confirmed) => {
      this.confirmPopupResult.set(confirmed === undefined ? 'dismissed (Esc/outside click)' : 'acknowledged');
    });
  }

  protected openConfirmPopupHeadless(event: MouseEvent): void {
    const handle = this.confirmPopupService.confirm(event.currentTarget as HTMLElement, {
      message: '1 item will be moved.',
      headlessTemplate: this.confirmPopupHeadlessTpl,
    });
    handle?.closed$.subscribe((confirmed) => {
      this.confirmPopupResult.set(confirmed === undefined ? 'dismissed (Esc/outside click)' : confirmed ? 'accepted (archive)' : 'rejected (cancel)');
    });
  }

  protected showToast(severity: 'info' | 'success' | 'warn' | 'danger'): void {
    const bySeverity = {
      info: () => this.toastService.info('Here is some information.', { summary: 'FYI' }),
      success: () => this.toastService.success('Your changes were saved.', { summary: 'Success' }),
      warn: () => this.toastService.warn('Your session expires soon.', { summary: 'Careful' }),
      danger: () => this.toastService.error('Could not save your changes.', { summary: 'Error', closeLabel: 'Fechar' }),
    };
    bySeverity[severity]();
  }

  protected showToastAt(position: GlobalOverlayPosition): void {
    this.toastService.info(`Now anchored to ${position}.`, { summary: 'Position', position });
  }

  @ViewChild('toastHeadlessTpl')
  protected toastHeadlessTpl!: TemplateRef<{ $implicit: ToastMessage; onClose: () => void }>;

  protected showToastHeadless(): void {
    this.toastService.show({ detail: 'Custom pill-shaped toast.', headlessTemplate: this.toastHeadlessTpl });
  }

  private readonly overlayService = inject(OverlayService);
  private overlayDemoHandle: OverlayHandle<OverlayDemoPanel, void> | null = null;
  protected readonly overlayOpenCount = signal(0);
  protected readonly splitDropdownCount = signal(0);
  protected readonly speedDialRadialVisible = signal(false);
  protected readonly selectButtonPlan = signal<string | null>('pro');
  protected readonly selectButtonPlans = [
    { name: 'Starter', code: 'starter', inactive: false },
    { name: 'Pro', code: 'pro', inactive: false },
    { name: 'Enterprise', code: 'ent', inactive: true },
  ];
  protected readonly toggleReadonlyValue = signal(true);
  protected readonly toggleNoEmptyValue = signal(true);

  protected openOverlayDemo(event: MouseEvent): void {
    if (this.overlayDemoHandle) {
      this.overlayDemoHandle.close();
      this.overlayDemoHandle = null;
      return;
    }
    const anchor = event.currentTarget as HTMLElement;
    this.overlayDemoHandle = this.overlayService.openAnchored(OverlayDemoPanel, anchor);
    this.overlayOpenCount.update((c) => c + 1);
    this.overlayDemoHandle.closed$.subscribe(() => {
      this.overlayDemoHandle = null;
    });
  }
}
