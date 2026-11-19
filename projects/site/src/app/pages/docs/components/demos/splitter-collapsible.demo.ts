import { Component } from '@angular/core';
import { SplitterComponent, SplitterGutterComponent, SplitterPanelComponent } from '@medra/ui';

@Component({
  selector: 'app-splitter-collapsible-demo',
  imports: [SplitterComponent, SplitterGutterComponent, SplitterPanelComponent],
  templateUrl: './splitter-collapsible.demo.html',
})
export class SplitterCollapsibleDemo {}
