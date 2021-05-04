import { ComponentType, Dispatch, SetStateAction } from 'react';

export type StyleProps = {
  className?: string;
};

export type AlertComponentProps<T> = {
  componentData?: T;
  onChange: Dispatch<SetStateAction<T | undefined>>;
};

export type AlertButton<T> = {
  text: string;
  value?: any;
  validate?: (data: T) => boolean;
  className?: string;
  'data-alert-button': string;
};

export type AlertData<T = unknown> = {
  title?: string | ComponentType<StyleProps>;
  message?: string | ComponentType<StyleProps>;
  component?: ComponentType<AlertComponentProps<T>>;
  buttons: AlertButton<T>[];
  showCloseButton?: boolean;
  resizable?: boolean;
};

export type Alerter = {
  showCustomAlert: (alert: AlertData) => void;
  showAlert: (alert: Omit<AlertData, 'buttons' | 'showCloseButton'>) => void;
  showConfirm: (alert: Omit<AlertData, 'buttons'>) => void;
};
