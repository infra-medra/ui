import { Component } from '@angular/core';
import { GalleriaComponent, type GalleriaItem } from '@medra.dev/ui';

function placeholderPhoto(label: string, color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400">
    <rect width="640" height="400" fill="${color}" />
    <text x="320" y="200" font-family="sans-serif" font-size="28" fill="white" text-anchor="middle" dominant-baseline="middle">${label}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

@Component({
  selector: 'app-galleria-autoplay-demo',
  imports: [GalleriaComponent],
  templateUrl: './galleria-autoplay.demo.html',
})
export class GalleriaAutoplayDemo {
  protected readonly photos: GalleriaItem[] = [
    { src: placeholderPhoto('Sunrise Ridge', '#b45309'), alt: 'Sunrise Ridge trailhead at dawn' },
    { src: placeholderPhoto('Pine Overlook', '#166534'), alt: 'Pine Overlook viewpoint' },
    { src: placeholderPhoto('River Bend', '#0369a1'), alt: 'River Bend crossing' },
    { src: placeholderPhoto('Granite Pass', '#57534e'), alt: 'Granite Pass switchbacks' },
  ];
}
