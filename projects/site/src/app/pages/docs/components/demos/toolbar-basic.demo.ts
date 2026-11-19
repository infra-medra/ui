import { Component } from '@angular/core';
import { ButtonDirective, ToolbarCenterDirective, ToolbarComponent, ToolbarEndDirective, ToolbarStartDirective } from '@medra.dev/ui';

@Component({
  selector: 'app-toolbar-basic-demo',
  imports: [ButtonDirective, ToolbarCenterDirective, ToolbarComponent, ToolbarEndDirective, ToolbarStartDirective],
  templateUrl: './toolbar-basic.demo.html',
})
export class ToolbarBasicDemo {}
