import { createContext, FunctionComponent, useContext } from 'react';
import { connect } from 'react-redux';
import { Alerter } from '../components/alerts/types';
import { showCustomAlert, showAlert, showConfirm } from '../store/ducks/alerts';

const notImplemented = () => Promise.reject(new Error('not implemented'));

export const AlertsContext = createContext<Alerter>({
  showCustomAlert: notImplemented,
  showAlert: notImplemented,
  showConfirm: notImplemented,
});

const Provider: FunctionComponent<Alerter> = ({
  children,
  showCustomAlert,
  showAlert,
  showConfirm,
}) => {
  return (
    <AlertsContext.Provider value={{ showCustomAlert, showAlert, showConfirm }}>
      {children}
    </AlertsContext.Provider>
  );
};

export const AlertsProvider = connect(null, ({
  showCustomAlert,
  showAlert,
  showConfirm,
} as unknown) as Alerter)(Provider);

export const useAlerter = () => useContext(AlertsContext);
