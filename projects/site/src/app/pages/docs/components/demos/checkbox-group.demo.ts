import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxComponent } from '@medra/ui';

@Component({
  selector: 'app-checkbox-group-demo',
  imports: [FormsModule, CheckboxComponent],
  templateUrl: './checkbox-group.demo.html',
})
export class CheckboxGroupDemo {
  protected readonly topics = ['Angular', 'RxJS', 'TypeScript'];
  protected selectedTopics: string[] = ['Angular'];
  protected acceptance: 'yes' | 'no' = 'no';
}
