import React, { FunctionComponent, useEffect, useRef } from 'react';
import { Prompt } from 'react-router';

export type RouteLeaveGuardProps = {
  guard: boolean;
  message: string;
  className?: string;
};

export const RouteLeaveGuard: FunctionComponent<RouteLeaveGuardProps> = ({
  message,
  guard,
  className,
  children,
}) => {
  const ref = useRef({ message, guard });
  ref.current = { message, guard };

  useEffect(() => {
    const onUnload = (e: BeforeUnloadEvent) => {
      if (ref.current.guard) {
        e = e || window.event;
        e.returnValue = ref.current.message;
        return ref.current.message;
      }
    };

    window.addEventListener('beforeunload', onUnload);

    return () => window.removeEventListener('beforeunload', onUnload);
  }, []);

  return (
    <div className={className}>
      <Prompt message={message} when={guard} />
      {children}
    </div>
  );
};
