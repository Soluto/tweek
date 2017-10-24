import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import './RevisionHistory.css';

const formatDate = date =>
  `${moment(new Date(date)).calendar(null, { sameElse: 'DD/MM/YYYY [at] HH:mm' })}`;

const RevisionHistory = ({ revisionHistory, goToRevision, selectedKey, revision }) =>
  revisionHistory.length === 0
    ? <div data-comp="revision-history" data-no-changes style={{ color: 'gray' }}>No recent changes found</div>
    : <select
        data-comp="revision-history"
        className="revision-history"
        value={revision ? revision : revisionHistory[0]}
        onChange={e => goToRevision(selectedKey, e.target.value)}
      >
        {revisionHistory.map(item =>
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
