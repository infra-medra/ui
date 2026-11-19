import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CascadeSelectComponent, type CascadeSelectOption } from '@medra.dev/ui';

@Component({
  selector: 'app-cascade-select-basic-demo',
  imports: [FormsModule, CascadeSelectComponent],
  templateUrl: './cascade-select-basic.demo.html',
})
export class CascadeSelectBasicDemo {
  protected readonly catalog: CascadeSelectOption<string>[] = [
    {
      label: 'Power Tools',
      children: [
        {
          label: 'Drills',
          children: [
            { label: 'Cordless Drill', value: 'cordless-drill' },
            { label: 'Hammer Drill', value: 'hammer-drill' },
          ],
        },
        {
          label: 'Saws',
          children: [
            { label: 'Circular Saw', value: 'circular-saw' },
            { label: 'Jigsaw', value: 'jigsaw' },
          ],
        },
      ],
    },
    {
      label: 'Hand Tools',
      children: [
        {
          label: 'Wrenches',
          children: [
            { label: 'Adjustable Wrench', value: 'adjustable-wrench' },
            { label: 'Socket Wrench', value: 'socket-wrench' },
          ],
        },
        {
          label: 'Pliers',
          children: [
            { label: 'Needle-nose Pliers', value: 'needle-nose-pliers' },
            { label: 'Locking Pliers', value: 'locking-pliers' },
          ],
        },
      ],
    },
  ];

  protected item: string | null = null;
}
