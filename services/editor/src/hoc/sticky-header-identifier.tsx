import React, { ComponentType, useEffect, useState } from 'react';

const stickyHeaderIdentifier = (elementId: string, triggerScrollFromTop: number) => <
  T extends { isInStickyMode: boolean }
>(
  Component: ComponentType<T>,
) => (props: Omit<T, 'isInStickyMode'>) => {
  const [isInStickyMode, setIsInStickyMode] = useState(false);

  useEffect(() => {
    const element = document.getElementById(elementId);

    const handler = (event: Event) => {
      const distanceFromTop = (event.target as Element).scrollTop;
      const shouldShowSticky = distanceFromTop > triggerScrollFromTop;
      setIsInStickyMode(shouldShowSticky);
    };

    element?.addEventListener('scroll', handler);

    return () => element?.removeEventListener('scroll', handler);
  }, []);

  // @ts-ignore
  return <Component {...props} isInStickyMode={isInStickyMode} />;
};

export default stickyHeaderIdentifier;
