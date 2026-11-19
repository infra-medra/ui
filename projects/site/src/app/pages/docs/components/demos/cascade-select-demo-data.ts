import type { CascadeSelectOption } from '@medra/ui';

/** Two-level catalog shared by the template examples of the CascadeSelect page. */
export const CASCADE_SELECT_CATALOG: CascadeSelectOption<string>[] = [
  {
    label: 'Power Tools',
    children: [
      { label: 'Cordless Drill', value: 'cordless-drill' },
      { label: 'Circular Saw', value: 'circular-saw' },
    ],
  },
  {
    label: 'Hand Tools',
    children: [
      { label: 'Adjustable Wrench', value: 'adjustable-wrench' },
      { label: 'Locking Pliers', value: 'locking-pliers' },
    ],
  },
];
