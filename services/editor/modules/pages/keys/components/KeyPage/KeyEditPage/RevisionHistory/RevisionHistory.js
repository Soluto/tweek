import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux'
import { push } from 'react-router-redux'

const RevisionHistory = (({ revisionHistory, goToRevision, selectedKey, revision }) => {
  return (
    <div>
      <select value={revision} onChange={(e) => goToRevision(selectedKey, e.target.value)} >
        {revisionHistory.map(item => (
          <option key={item.sha} value={item.sha}>
            {moment(item.date).format('DD/MM/YYYY hh:mm:ss')}
          </option>
        ))}
      </select>
    </div>
  );
});

const goToRevision = (key, sha) => push({
  pathname: `/keys/${key}`,
  query: {
    revision: sha
  }
})

export default connect(({ selectedKey: { key } }) => ({ selectedKey: key }), { goToRevision })(RevisionHistory);