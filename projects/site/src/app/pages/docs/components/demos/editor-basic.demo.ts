import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EditorComponent } from '@medra/ui';

@Component({
  selector: 'app-editor-basic-demo',
  imports: [FormsModule, EditorComponent],
  templateUrl: './editor-basic.demo.html',
})
export class EditorBasicDemo {
  protected notes = '<p>Ship the <strong>v2.4</strong> release notes here.</p>';
}
