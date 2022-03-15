import type {
  FocusEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
  Ref,
} from 'react';

export type MultiSelectAnchorParams = {
  ref: Ref<Element>;
  disabled: boolean;
  placeholder: string | undefined;
  filled: boolean;
  onClick: MouseEventHandler;
  onBlur: FocusEventHandler;
  onKeyUp: KeyboardEventHandler;
  onKeyDown: KeyboardEventHandler;
};