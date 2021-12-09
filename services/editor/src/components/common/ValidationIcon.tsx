import React, { useEffect, useRef } from 'react';
import ReactTooltip from 'react-tooltip';
import { v4 as uuid } from 'uuid';

export type ValidationIconProps = {
  show: boolean;
  hint?: string;
};

const ValidationIcon = ({ show, hint }: ValidationIconProps) => {
  const tooltipId = useRef(uuid());

  useEffect(() => {
    ReactTooltip.rebuild();
  }, [hint]);

  return (
    <div
      className="validation-icon-wrapper"
      data-comp="validation-icon"
      data-is-shown={show}
      style={{ opacity: show ? 1 : 0 }}
    >
      <i
        className="validation-icon"
        data-tip={hint}
        data-for={tooltipId.current}
        data-tip-disable={!show || !hint}
        data-delay-hide={500}
        data-effect="solid"
        data-place="top"
      />
      <ReactTooltip id={tooltipId.current} />
    </div>
  );
};

export default ValidationIcon;
