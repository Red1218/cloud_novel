export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onPress: () => void;
}

export interface ToastMessage {
  id: string;
  type: ToastType;
  /** What happened, in sentence case. */
  title: string;
  /** One or two lines of detail under the title. */
  message?: string;
  /** A text button on the bar, e.g. Undo or View; tapping it also dismisses the bar. */
  action?: ToastAction;
  /** An info bar about a bookmark shows the ribbon instead of the "i". */
  icon?: 'bookmark';
}
