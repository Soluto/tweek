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

export type AlertData<T> = {
  title?: string | ComponentType<StyleProps>;
  message?: string | ComponentType<StyleProps>;
  component?: ComponentType<AlertComponentProps<T>>;
  buttons: AlertButton<T>[];
  showCloseButton?: boolean;
  resizable?: boolean;
};

export type AlertResult<T> = {
  result?: any;
  data?: T;
};

export type Alerter = {
  showCustomAlert: <T>(alert: AlertData<T>) => Promise<AlertResult<T>>;
  showAlert: <T>(
    alert: Omit<AlertData<T>, 'buttons' | 'showCloseButton'>,
  ) => Promise<AlertResult<T>>;
  showConfirm: <T>(alert: Omit<AlertData<T>, 'buttons'>) => Promise<AlertResult<T>>;
};
