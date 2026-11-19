import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('MedraUi showcase');
  });

  // @scenario SHOW-002.S1
  it('should render interactive demos for all Wave 1 missing components, toolbar, data-view, and buttons Wave 1 features', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    const wave1Ids = [
      'autocomplete',
      'cascade-select',
      'color-picker',
      'date-picker',
      'editor',
      'image',
      'mega-menu',
      'menu',
      'organization-chart',
      'overlay',
      'panel-menu',
      'password',
      'ripple',
      'select',
      'tiered-menu',
      'tree-select',
      'toolbar',
      'data-view',
      'buttons',
    ];

    for (const id of wave1Ids) {
      expect(compiled.querySelector(`[data-showcase-demo="${id}"]`)).not.toBeNull();
    }

    expect(compiled.querySelector('[data-med-button-badge]')).not.toBeNull();
    expect(compiled.querySelector('[data-showcase-demo="ripple"] [medRipple]')).not.toBeNull();
    expect(compiled.querySelector('[data-showcase-demo="overlay"] button')).not.toBeNull();
  });

  // @scenario SHOW-003.S1
  it('should render interactive CDN icon demos for buttons, tags, inputs, and menus [SHOW-003.S1]', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    const cdnDemo = compiled.querySelector('[data-showcase-demo="cdn-icons"]');
    expect(cdnDemo).not.toBeNull();

    // Verify CDN icons in buttons, tags, inputs, and menus
    expect(cdnDemo?.querySelector('[data-showcase-cdn="button"] i.fa-solid')).not.toBeNull();
    expect(cdnDemo?.querySelector('[data-showcase-cdn="tag"] i.fa-solid')).not.toBeNull();
    expect(cdnDemo?.querySelector('[data-showcase-cdn="input"] i.fa-solid')).not.toBeNull();
    expect(cdnDemo?.querySelector('[data-showcase-cdn="menu"] i.fa-solid')).not.toBeNull();
  });
});
