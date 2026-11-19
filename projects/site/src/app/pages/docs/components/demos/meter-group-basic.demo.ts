import { Component } from '@angular/core';
import { MeterGroupComponent, type MeterItem } from '@medra.dev/ui';

@Component({
  selector: 'app-meter-group-basic-demo',
  imports: [MeterGroupComponent],
  templateUrl: './meter-group-basic.demo.html',
})
export class MeterGroupBasicDemo {
  protected readonly storage: MeterItem[] = [
    { label: 'Photos', value: 42, severity: 'info', icon: 'photo' },
    { label: 'Videos', value: 28, severity: 'help', icon: 'video-camera' },
    { label: 'Documents', value: 11, severity: 'success', icon: 'document-text' },
    { label: 'Other', value: 6, severity: 'secondary', icon: 'folder' },
  ];
}
