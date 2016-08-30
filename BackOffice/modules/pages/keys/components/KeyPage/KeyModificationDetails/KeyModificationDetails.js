import React from 'react';
import moment from 'moment';
import wrapComponentWithClass from '../../../../../utils/wrapComponentWithClass';
import style from './KeyModificationDetails.css';

const modifyDateFromat = 'DD/MM/YYYY HH:mm';

const KeyModificationDetails = wrapComponentWithClass(({ modifyCompareUrl, modifyDate, modifyUser }) => {
  const modifyDateFromNow = moment(modifyDate).fromNow();
  const formatedModifyDate = 'Modify date: ' + moment(modifyDate).format(modifyDateFromat);

  return (
    <div className={style['modification-details-text']} title={ formatedModifyDate }>
      <a href={modifyCompareUrl}
        target="_blank"
        >
        <label>Last modify: </label>
        <label className={style['actual-sub-text']}>{modifyDateFromNow}, by {modifyUser}</label>
      </a>
    </div>
  );
});

export default KeyModificationDetails;