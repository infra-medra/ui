import { Component } from '@angular/core';
import { MeterGroupComponent, type MeterItem } from '@medra/ui';

@Component({
  selector: 'app-meter-group-vertical-demo',
  imports: [MeterGroupComponent],
  templateUrl: './meter-group-vertical.demo.html',
})
export class MeterGroupVerticalDemo {
  protected readonly storage: MeterItem[] = [
    { label: 'Photos', value: 42, severity: 'info', icon: 'photo' },
    { label: 'Videos', value: 28, severity: 'help', icon: 'video-camera' },
    { label: 'Documents', value: 11, severity: 'success', icon: 'document-text' },
  ];

  protected total(items: readonly MeterItem[]): number {
    return items.reduce((sum, item) => sum + item.value, 0);
  }
}
