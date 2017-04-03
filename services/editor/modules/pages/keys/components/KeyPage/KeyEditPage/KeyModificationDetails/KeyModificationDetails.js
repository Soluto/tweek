import React from 'react';
import moment from 'moment';
import wrapComponentWithClass from '../../../../../../hoc/wrap-component-with-class';
import style from './KeyModificationDetails.css';

const KeyModificationDetails = wrapComponentWithClass(({ modifyCompareUrl, modifyDate, modifyUser }) => {
  return (
    <div className={style['modification-details-text']}>
      <a href={modifyCompareUrl}
        target="_blank"
        >
        <label>Last modify: </label>
        <label className={style['actual-sub-text']}>
          { modifyDate == "unknown" ? "Unknown" : `${moment(modifyDate).fromNow()}, by ${modifyUser}`}
        </label>
      </a>
    </div>
  );
});

export default KeyModificationDetails;