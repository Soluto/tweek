import React, { memo, useEffect, useState } from 'react';

const stickyHeaderIdentifier = (elementId, triggerScrollFromTop) => (Comp) =>
  memo((props) => {
    const [isInStickyMode, setIsInStickyMode] = useState(false);

    useEffect(() => {
      const element = document.getElementById(elementId);
      const handler = (eventArgs) => {
        const distanceFromTop = eventArgs.target.scrollTop;
        const shouldShowSticky = distanceFromTop > triggerScrollFromTop;
        setIsInStickyMode(shouldShowSticky);
      };

      element.addEventListener('scroll', handler);

      return () => element.removeEventListener('scroll', handler);
    }, []);

    return <Comp {...props} isInStickyMode={isInStickyMode} />;
  });

export default stickyHeaderIdentifier;
