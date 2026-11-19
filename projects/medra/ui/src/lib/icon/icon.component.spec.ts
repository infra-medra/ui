import { TestBed } from '@angular/core/testing';
import { IconComponent } from './icon.component';
import {
  CustomIconData,
  FontAwesomeIconDefinition,
  fromFontAwesome,
  provideIcons,
} from './icon-registry';

const FAKE_OUTLINE_PATH = '<path d="M1 1h1v1H1z"/>';
const FAKE_SOLID_PATH = '<path d="M2 2h2v2H2z"/>';

const FAKE_FA_COFFEE: FontAwesomeIconDefinition = {
  prefix: 'fas',
  iconName: 'coffee',
  icon: [640, 512, [], 'f0f4', 'M192 384h256c17.7 0 32-14.3 32-32V64H160v288c0 17.7 14.3 32 32 32z'],
};

const FAKE_FA_USER: FontAwesomeIconDefinition = {
  prefix: 'fas',
  iconName: 'user',
  icon: [448, 512, [], 'f007', 'M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256z'],
};

const FAKE_FA_DUOTONE: FontAwesomeIconDefinition = {
  prefix: 'fad',
  iconName: 'camera',
  icon: [512, 512, [], 'f030', ['M10 10h50v50H10z', 'M70 70h30v30H70z']],
};

function createIcon() {
  const fixture = TestBed.createComponent(IconComponent);
  fixture.componentRef.setInput('name', 'academic-cap');
  fixture.detectChanges();
  return fixture;
}

describe('IconComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [IconComponent],
      providers: [
        provideIcons({
          outline: { academicCap: FAKE_OUTLINE_PATH },
          solid: { academicCap: FAKE_SOLID_PATH, faCoffee: FAKE_FA_COFFEE },
        }),
      ],
    });
  });

  it('centers itself with inline-flex on the host, independent of surrounding line-height', () => {
    const fixture = createIcon();
    const hostElement = fixture.nativeElement as HTMLElement;

    expect(hostElement.classList.contains('inline-flex')).toBe(true);
    expect(hostElement.classList.contains('items-center')).toBe(true);
  });

  it('renders the registered markup for the default variant (outline) [UI-002.S1]', () => {
    const fixture = createIcon();
    const svg = fixture.nativeElement.querySelector('svg') as SVGElement;

    expect(svg.getAttribute('viewBox')).toBe('0 0 24 24');
    expect(svg.getAttribute('fill')).toBe('none');
    expect(svg.getAttribute('stroke')).toBe('currentColor');
    expect(svg.innerHTML).toContain('M1 1h1v1H1z');
  });

  it('switches markup when the variant changes to solid', () => {
    const fixture = createIcon();
    fixture.componentRef.setInput('variant', 'solid');
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector('svg') as SVGElement;

    expect(svg.getAttribute('fill')).toBe('currentColor');
    expect(svg.hasAttribute('stroke')).toBe(false);
    expect(svg.innerHTML).toContain('M2 2h2v2H2z');
  });

  it('accepts a camelCase name equivalent to the kebab-case one', () => {
    const fixture = TestBed.createComponent(IconComponent);
    fixture.componentRef.setInput('name', 'academicCap');
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector('svg') as SVGElement;

    expect(svg.innerHTML).toContain('M1 1h1v1H1z');
  });

  it('is decorative by default (aria-hidden) and becomes role=img only with ariaLabel', () => {
    const fixture = createIcon();
    let svg = fixture.nativeElement.querySelector('svg') as SVGElement;
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.hasAttribute('role')).toBe(false);

    fixture.componentRef.setInput('ariaLabel', 'Academic training');
    fixture.detectChanges();
    svg = fixture.nativeElement.querySelector('svg') as SVGElement;
    expect(svg.hasAttribute('aria-hidden')).toBe(false);
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe('Academic training');
  });

  it('merges the consumer class with the default size via mergeClasses', () => {
    const fixture = createIcon();
    fixture.componentRef.setInput('class', 'size-4 text-brand-500');
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector('svg') as SVGElement;

    expect(svg.getAttribute('class')).toContain('size-4');
    expect(svg.getAttribute('class')).toContain('text-brand-500');
    expect(svg.getAttribute('class')).not.toContain('size-[var(--icon-size,1.5rem)]');
  });

  it('warns on the console and renders a visible dashed placeholder when the icon was not registered [UI-002.S2]', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const fixture = TestBed.createComponent(IconComponent);
    fixture.componentRef.setInput('name', 'does-not-exist');
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector('svg') as SVGElement;

    expect(svg.innerHTML.trim()).not.toBe('');
    expect(svg.querySelector('rect')).not.toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('does-not-exist'));
    warnSpy.mockRestore();
  });

  describe('Font Awesome & custom icon support', () => {
    it('renders Font Awesome icon definition passed directly via [icon] input', () => {
      const fixture = TestBed.createComponent(IconComponent);
      fixture.componentRef.setInput('icon', FAKE_FA_USER);
      fixture.detectChanges();
      const svg = fixture.nativeElement.querySelector('svg') as SVGElement;

      expect(svg.getAttribute('viewBox')).toBe('0 0 448 512');
      expect(svg.getAttribute('fill')).toBe('currentColor');
      expect(svg.hasAttribute('stroke')).toBe(false);
      expect(svg.innerHTML).toContain('M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256z');
    });

    it('renders Font Awesome icon registered via provideIcons with dynamic viewBox', () => {
      const fixture = TestBed.createComponent(IconComponent);
      fixture.componentRef.setInput('name', 'fa-coffee');
      fixture.detectChanges();
      const svg = fixture.nativeElement.querySelector('svg') as SVGElement;

      expect(svg.getAttribute('viewBox')).toBe('0 0 640 512');
      expect(svg.getAttribute('fill')).toBe('currentColor');
      expect(svg.innerHTML).toContain('M192 384h256c17.7 0 32-14.3 32-32V64H160v288c0 17.7 14.3 32 32 32z');
    });

    it('finds registered Font Awesome icon when name omits "fa-" prefix', () => {
      const fixture = TestBed.createComponent(IconComponent);
      fixture.componentRef.setInput('name', 'coffee');
      fixture.detectChanges();
      const svg = fixture.nativeElement.querySelector('svg') as SVGElement;

      expect(svg.getAttribute('viewBox')).toBe('0 0 640 512');
      expect(svg.innerHTML).toContain('M192 384h256c17.7 0 32-14.3 32-32V64H160v288c0 17.7 14.3 32 32 32z');
    });

    it('renders multi-path (duotone) Font Awesome icons with opacity on secondary path', () => {
      const fixture = TestBed.createComponent(IconComponent);
      fixture.componentRef.setInput('icon', FAKE_FA_DUOTONE);
      fixture.detectChanges();
      const svg = fixture.nativeElement.querySelector('svg') as SVGElement;

      expect(svg.getAttribute('viewBox')).toBe('0 0 512 512');
      expect(svg.querySelectorAll('path').length).toBe(2);
      expect(svg.innerHTML).toContain('opacity="0.4"');
    });

    it('renders CustomIconData with explicit viewBox and colors', () => {
      const custom: CustomIconData = {
        viewBox: '0 0 32 32',
        markup: '<circle cx="16" cy="16" r="10"/>',
        fill: 'pink',
      };
      const fixture = TestBed.createComponent(IconComponent);
      fixture.componentRef.setInput('icon', custom);
      fixture.detectChanges();
      const svg = fixture.nativeElement.querySelector('svg') as SVGElement;

      expect(svg.getAttribute('viewBox')).toBe('0 0 32 32');
      expect(svg.getAttribute('fill')).toBe('pink');
      expect(svg.innerHTML).toContain('circle cx="16"');
    });

    it('extracts viewBox from a full <svg> string if provided', () => {
      const svgString = '<svg viewBox="0 0 48 48"><polygon points="24,0 48,48 0,48"/></svg>';
      const fixture = TestBed.createComponent(IconComponent);
      fixture.componentRef.setInput('icon', svgString);
      fixture.detectChanges();
      const svg = fixture.nativeElement.querySelector('svg') as SVGElement;

      expect(svg.getAttribute('viewBox')).toBe('0 0 48 48');
      expect(svg.innerHTML).toContain('polygon points="24,0 48,48 0,48"');
    });

    it('converts Font Awesome definition using fromFontAwesome helper correctly', () => {
      const converted = fromFontAwesome(FAKE_FA_USER);
      expect(converted.viewBox).toBe('0 0 448 512');
      expect(converted.fill).toBe('currentColor');
      expect(converted.stroke).toBeNull();
      expect(converted.markup).toContain('<path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256z"/>');
    });

    describe('CDN and CSS font icon support', () => {
      it('renders an <i> tag when fontIcon input is provided (e.g. Font Awesome CDN) [UI-002.S3]', () => {
        const fixture = TestBed.createComponent(IconComponent);
        fixture.componentRef.setInput('fontIcon', 'fa-solid fa-coffee');
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('svg')).toBeNull();
        const icon = fixture.nativeElement.querySelector('i') as HTMLElement;
        expect(icon).not.toBeNull();
        expect(icon.className).toContain('fa-solid');
        expect(icon.className).toContain('fa-coffee');
      });

      it('renders an <i> tag when name contains spaces or font prefixes (e.g. font icon class string) [UI-002.S3]', () => {
        const fixture = TestBed.createComponent(IconComponent);
        fixture.componentRef.setInput('name', 'fa-solid fa-coffee');
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('svg')).toBeNull();
        const icon = fixture.nativeElement.querySelector('i') as HTMLElement;
        expect(icon).not.toBeNull();
        expect(icon.className).toContain('fa-solid');
        expect(icon.className).toContain('fa-coffee');
      });

      it('does not warn on console when rendering a font icon via name or fontIcon [UI-002.S3]', () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        const fixture = TestBed.createComponent(IconComponent);
        fixture.componentRef.setInput('name', 'fa-brands fa-github');
        fixture.detectChanges();

        expect(warnSpy).not.toHaveBeenCalled();
        warnSpy.mockRestore();
      });

      it('renders an <i> tag with aria-hidden="true" when decorative font icon [UI-002.S4]', () => {
        const fixture = TestBed.createComponent(IconComponent);
        fixture.componentRef.setInput('fontIcon', 'fa-solid fa-bell');
        fixture.detectChanges();

        const icon = fixture.nativeElement.querySelector('i') as HTMLElement;
        expect(icon.getAttribute('aria-hidden')).toBe('true');
        expect(icon.hasAttribute('role')).toBe(false);
      });

      it('applies accessibility attributes and custom classes to font icon <i> tag [UI-002.S4]', () => {
        const fixture = TestBed.createComponent(IconComponent);
        fixture.componentRef.setInput('fontIcon', 'fa-solid fa-bell');
        fixture.componentRef.setInput('ariaLabel', 'Notifications');
        fixture.componentRef.setInput('class', 'text-brand-500 text-lg');
        fixture.detectChanges();

        const icon = fixture.nativeElement.querySelector('i') as HTMLElement;
        expect(icon.getAttribute('role')).toBe('img');
        expect(icon.getAttribute('aria-label')).toBe('Notifications');
        expect(icon.hasAttribute('aria-hidden')).toBe(false);
        expect(icon.className).toContain('text-brand-500');
        expect(icon.className).toContain('text-lg');
      });
    });
  });
});
