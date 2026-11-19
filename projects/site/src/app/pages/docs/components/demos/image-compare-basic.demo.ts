import { Component } from '@angular/core';
import { ImageCompareComponent } from '@medra/ui';

/** Flat-colored placeholder image as an inline SVG data URI — no external image host involved. */
function placeholderRoom(label: string, wallColor: string, floorColor: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400">
    <rect width="640" height="260" fill="${wallColor}" />
    <rect y="260" width="640" height="140" fill="${floorColor}" />
    <text x="320" y="200" font-family="sans-serif" font-size="26" fill="white" text-anchor="middle" dominant-baseline="middle">${label}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

@Component({
  selector: 'app-image-compare-basic-demo',
  imports: [ImageCompareComponent],
  templateUrl: './image-compare-basic.demo.html',
})
export class ImageCompareBasicDemo {
  protected readonly beforeSrc = placeholderRoom('Living room — before', '#78716c', '#44403c');
  protected readonly afterSrc = placeholderRoom('Living room — after', '#fde68a', '#a8a29e');
}
