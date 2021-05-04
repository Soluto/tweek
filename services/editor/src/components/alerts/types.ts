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

export type AlertResult = {
  result?: any;
};

export type Alerter = {
  showCustomAlert: (alert: AlertData) => Promise<AlertResult>;
  showAlert: (alert: Omit<AlertData, 'buttons' | 'showCloseButton'>) => Promise<AlertResult>;
  showConfirm: (alert: Omit<AlertData, 'buttons'>) => Promise<AlertResult>;
};
