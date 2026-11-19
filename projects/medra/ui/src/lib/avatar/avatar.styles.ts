export type AvatarSize = 'sm' | 'default' | 'lg' | 'xl';
export type AvatarShape = 'circle' | 'square';

export const AVATAR_SIZE_CLASS: Record<AvatarSize, string> = {
  sm: 'size-8 text-xs',
  default: 'size-10 text-sm',
  lg: 'size-12 text-base',
  xl: 'size-16 text-lg',
};

export const AVATAR_ICON_SIZE_CLASS: Record<AvatarSize, string> = {
  sm: 'size-4',
  default: 'size-5',
  lg: 'size-6',
  xl: 'size-8',
};

export const AVATAR_SHAPE_CLASS: Record<AvatarShape, string> = {
  circle: 'rounded-full',
  square: 'rounded-md',
};
