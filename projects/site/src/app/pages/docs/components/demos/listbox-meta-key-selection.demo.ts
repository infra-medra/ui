import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ListboxComponent, type SelectOption } from '@medra/ui';

@Component({
  selector: 'app-listbox-meta-key-selection-demo',
  imports: [FormsModule, ListboxComponent],
  templateUrl: './listbox-meta-key-selection.demo.html',
})
export class ListboxMetaKeySelectionDemo {
  protected readonly files: SelectOption<string>[] = [
    { label: 'README.md', value: 'readme' },
    { label: 'package.json', value: 'package' },
    { label: 'tsconfig.json', value: 'tsconfig' },
    { label: 'angular.json', value: 'angular' },
    { label: 'LICENSE', value: 'license' },
  ];

  protected selectedFiles: string[] = [];
}
