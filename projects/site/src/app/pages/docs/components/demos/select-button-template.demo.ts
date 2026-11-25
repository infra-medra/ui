import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent, SelectButtonComponent, type SelectOption } from '@medra.dev/ui';

type ViewMode = 'list' | 'media' | 'video';

@Component({
  selector: 'app-select-button-template-demo',
  imports: [FormsModule, IconComponent, SelectButtonComponent],
  templateUrl: './select-button-template.demo.html',
})
export class SelectButtonTemplateDemo {
  protected readonly options: SelectOption<ViewMode>[] = [
    { label: 'List', value: 'list' },
    { label: 'Media', value: 'media' },
    { label: 'Video', value: 'video' },
  ];

  private readonly icons: Record<ViewMode, string> = {
    list: 'list-bullet',
    media: 'photo',
    video: 'video-camera',
  };

  protected selectedView: ViewMode | null = 'list';

  protected iconFor(value: unknown): string {
    return this.icons[value as ViewMode] ?? 'list-bullet';
  }
}
