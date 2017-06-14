import React from 'react';
import moment from 'moment';
import R from 'ramda';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import './RevisionHistory.css';

const byDate = R.descend(R.prop('date'));

const formatDate = date => `${moment(date).calendar(null, { sameElse: 'DD/MM/YYYY [at] HH:mm' })}`;

const RevisionHistory = ({ revisionHistory, goToRevision, selectedKey, revision }) =>
  <select
    className="revision-history"
    value={revision}
    onChange={e => goToRevision(selectedKey, e.target.value)}
  >
    {R.sort(byDate, revisionHistory).map(item =>
      <option key={item.sha} value={item.sha}>
        {`${formatDate(item.date)} : ${item.author}`}
      </option>,
    )}
  </select>;

const goToRevision = (key, sha) =>
  push({
    pathname: `/keys/${key}`,
    query: {
      revision: sha,
    },
  });

export default connect(({ selectedKey: { key } }) => ({ selectedKey: key }), { goToRevision })(
  RevisionHistory,
);
