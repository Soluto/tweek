import React, { ComponentProps, ComponentType, useEffect, useRef } from 'react';
import { Prompt } from 'react-router';

const routeLeaveHook = <T,>(
  fn: (props: T) => boolean,
  message: string,
  wrapperProps?: ComponentProps<'div'>,
) => <Props extends T>(Component: ComponentType<Props>) => (props: Props) => {
  const shouldDisplayPrompt = useRef(false);
  shouldDisplayPrompt.current = fn(props);

  useEffect(() => {
    const onUnload = (e: BeforeUnloadEvent) => {
      if (shouldDisplayPrompt.current) {
        e = e || window.event;
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', onUnload);

    return () => window.removeEventListener('beforeunload', onUnload);
  }, []);

  return (
    <div {...wrapperProps}>
      <Prompt message={message} when={shouldDisplayPrompt.current} />
      <Component {...props} />
    </div>
  );
};

export default routeLeaveHook;
