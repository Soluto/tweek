import {
  ComponentType,
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { BehaviorSubject } from 'rxjs';
import { v4 as uuid } from 'uuid';

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
  validate?: (data: T) => boolean | null | undefined;
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

export type AlertButtonProps<T> = Omit<AlertButton<T>, 'value'> & {
  onClick: (data: T) => void;
};

export type VisibleAlert<T = unknown> = Omit<AlertData<T>, 'buttons'> & {
  buttons: AlertButtonProps<T>[];
  onClose: () => void;
  id: string;
};

export const AlertsContext = createContext(new BehaviorSubject<VisibleAlert<any>[]>([]));

export const useAlertsContext = () => useContext(AlertsContext);

export const useAlerts = () => {
  const alerts$ = useAlertsContext();
  const [alerts, setAlerts] = useState(alerts$.value);

  useEffect(() => {
    const subscription = alerts$.subscribe(setAlerts);
    return () => subscription.unsubscribe();
  }, [alerts$]);

  return alerts;
};

export const buttons = {
  OK: {
    text: 'OK',
    value: true,
    className: 'rodal-confirm-btn',
    'data-alert-button': 'ok',
  } as AlertButton<any>,
  CANCEL: {
    text: 'Cancel',
    value: false,
    className: 'rodal-cancel-btn',
    'data-alert-button': 'cancel',
  } as AlertButton<any>,
};

export type Alerter = {
  showCustomAlert: <T>(alert: AlertData<T>) => Promise<AlertResult<T>>;
  showAlert: <T>(
    alert: Omit<AlertData<T>, 'buttons' | 'showCloseButton'>,
  ) => Promise<AlertResult<T>>;
  showConfirm: <T>(alert: Omit<AlertData<T>, 'buttons'>) => Promise<AlertResult<T>>;
};

export const useAlerter = (): Alerter => {
  const alerts$ = useAlertsContext();

  const showCustomAlert = useCallback(
    <T>({ buttons, ...alertProps }: AlertData<T>) => {
      return new Promise<AlertResult<T>>((resolve) => {
        const id = uuid();
        const onClose = (result?: any, data?: T) => {
          alerts$.next(alerts$.value.filter((a) => a.id !== id));
          resolve({ result, data });
        };

        const alert: VisibleAlert<T> = {
          ...alertProps,
          id,
          onClose: () => onClose(),
          buttons: buttons.map(({ value, ...props }) => ({
            ...props,
            onClick: (data?: any) => onClose(value, data),
          })),
        };
        alerts$.next(alerts$.value.concat(alert));
      });
    },
    [alerts$],
  );

  const showAlert = useCallback(
    <T>(alertProps: Omit<AlertData<T>, 'buttons' | 'showCloseButton'>) =>
      showCustomAlert({
        ...alertProps,
        showCloseButton: true,
        buttons: [buttons.OK],
      }),
    [showCustomAlert],
  );

  const showConfirm = useCallback(
    <T>(alertProps: Omit<AlertData<T>, 'buttons'>) =>
      showCustomAlert({
        ...alertProps,
        buttons: [buttons.OK, buttons.CANCEL],
      }),
    [showCustomAlert],
  );

  return {
    showCustomAlert,
    showAlert,
    showConfirm,
  };
};
