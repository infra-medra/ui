import { Component } from '@angular/core';
import { SplitterComponent, SplitterGutterComponent, SplitterPanelComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-splitter-basic-demo',
  imports: [SplitterComponent, SplitterGutterComponent, SplitterPanelComponent],
  templateUrl: './splitter-basic.demo.html',
})
export class SplitterBasicDemo {}
