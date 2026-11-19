import { Component } from '@angular/core';
import { ChipComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-chip-basic-demo',
  imports: [ChipComponent],
  templateUrl: './chip-basic.demo.html',
})
export class ChipBasicDemo {
  protected tags = ['Design', 'Frontend', 'Remote'];

  protected removeTag(tag: string): void {
    this.tags = this.tags.filter((current) => current !== tag);
  }
}
