import { Component } from '@angular/core';
import { AvatarComponent } from '@medra/ui';

@Component({
  selector: 'app-avatar-basic-demo',
  imports: [AvatarComponent],
  templateUrl: './avatar-basic.demo.html',
})
export class AvatarBasicDemo {
  /** Deliberately unreachable — demonstrates the image-load-failure fallback to initials. */
  protected readonly brokenImageUrl = 'https://example.com/no-such-avatar.jpg';
}
