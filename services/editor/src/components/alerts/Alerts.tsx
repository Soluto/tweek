import classNames from 'classnames';
import React, { ComponentType, useState } from 'react';
// @ts-ignore
import Rodal from 'rodal';
import { StyleProps, useAlerts, VisibleAlert } from '../../contexts/Alerts';
import './Alerts.css';
import './Rodal.css';

const reactify = (Content: string | ComponentType<StyleProps>, props: StyleProps) =>
  typeof Content === 'string' ? (
    <div {...props}>
      {Content.split('\n').map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </div>
  ) : (
    <Content {...props} />
  );

export type AlertProps<T = unknown> = Omit<VisibleAlert<T>, 'id'> & {
  visible: boolean;
};

export const Alert = ({
  title,
  message,
  component: Component,
  buttons,
  visible,
  onClose,
  showCloseButton = false,
  resizable = false,
}: AlertProps) => {
  const [componentData, setComponentData] = useState<any>();
  return (
    <Rodal
      closeOnEsc={true}
      visible={visible}
      showCloseButton={showCloseButton}
      onClose={onClose}
      className={classNames('rodal-container', { resizable })}
    >
      {title && reactify(title, { className: 'rodal-header' })}
      {message && reactify(message, { className: 'rodal-body' })}
      {Component && <Component onChange={setComponentData} componentData={componentData} />}
      <div className={'rodal-button-container'}>
        {buttons.map(({ text, validate, onClick, ...props }, i) => (
          <button
            key={i}
            disabled={validate && !validate(componentData)}
            onClick={() => onClick(componentData)}
            {...props}
          >
            {text}
          </button>
        ))}
      </div>
    </Rodal>
  );
};

const Alerts = () => {
  const alerts = useAlerts();

  return (
    <div id="alerts">
      {alerts.map(({ id: key, ...alert }) => (
        <Alert key={key} visible {...alert} />
      ))}
    </div>
  );
};

export default Alerts;
