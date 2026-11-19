import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';
import { CardFooterDirective, CardHeaderDirective, CardSubtitleDirective, CardTitleDirective } from './card.directives';

describe('CardComponent', () => {
  it('renders the title and subtitle when provided', () => {
    const fixture = TestBed.createComponent(CardComponent);
    fixture.componentRef.setInput('title', 'Invoice #042');
    fixture.componentRef.setInput('subtitle', 'Due in 5 days');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h3')?.textContent).toBe('Invoice #042');
    expect(fixture.nativeElement.querySelector('p')?.textContent).toBe('Due in 5 days');
  });

  it('renders neither heading element when title/subtitle are omitted', () => {
    const fixture = TestBed.createComponent(CardComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h3')).toBeNull();
    expect(fixture.nativeElement.querySelector('p')).toBeNull();
  });

  it('projects default content into the body', () => {
    @Component({
      standalone: true,
      imports: [CardComponent],
      template: `<med-card><p class="body-marker">Body text</p></med-card>`,
    })
    class HostComponent {}

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.body-marker')?.textContent).toBe('Body text');
  });

  it('projects a medCardHeader element without wrapping it in the padded body', () => {
    @Component({
      standalone: true,
      imports: [CardComponent, CardHeaderDirective],
      template: `<med-card><img medCardHeader src="banner.png" alt="" /></med-card>`,
    })
    class HostComponent {}

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const img = fixture.nativeElement.querySelector('img[medCardHeader]');
    expect(img).not.toBeNull();
    expect(img.closest('.p-4')).toBeNull();
  });

  it('draws the footer divider/padding only when a medCardFooter element is projected', () => {
    @Component({
      standalone: true,
      imports: [CardComponent, CardFooterDirective],
      template: `<med-card><div medCardFooter class="footer-marker">Actions</div></med-card>`,
    })
    class HostComponent {}

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const footer = fixture.nativeElement.querySelector('.footer-marker');
    expect(footer).not.toBeNull();
    expect(footer.closest('.border-t')).not.toBeNull();
  });

  it('does not draw a footer divider when nothing is projected into it', () => {
    const fixture = TestBed.createComponent(CardComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.border-t')).toBeNull();
  });

  it('projects a medCardTitle element instead of the plain title() heading', () => {
    @Component({
      standalone: true,
      imports: [CardComponent, CardTitleDirective],
      template: `<med-card title="Ignored"><span medCardTitle class="title-marker">Rich <b>title</b></span></med-card>`,
    })
    class HostComponent {}

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.title-marker')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('h3')).toBeNull();
  });

  it('projects a medCardSubtitle element instead of the plain subtitle() paragraph', () => {
    @Component({
      standalone: true,
      imports: [CardComponent, CardSubtitleDirective],
      template: `<med-card subtitle="Ignored"><span medCardSubtitle class="subtitle-marker">Rich subtitle</span></med-card>`,
    })
    class HostComponent {}

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.subtitle-marker')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('p')).toBeNull();
  });

  it('merges a consumer class override onto the outer card', () => {
    const fixture = TestBed.createComponent(CardComponent);
    fixture.componentRef.setInput('class', 'shadow-none');
    fixture.detectChanges();

    const outer = fixture.nativeElement.firstElementChild as HTMLElement;
    expect(outer.className).toContain('shadow-none');
  });
});
