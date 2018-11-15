import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import styled from 'react-emotion';

const RevisionHistorySelect = styled('select')`
  align-self: flex-start;
`;

const formatDate = date =>
  `${moment(new Date(date)).calendar(null, { sameElse: 'DD/MM/YYYY [at] HH:mm' })}`;

const Revision = ({ sha, date, author }) => (
  <option value={sha}>{`${formatDate(date)} : ${author}`}</option>
);

const EmptyRevisionHistory = styled('div')`
  color: gray;
`;

const RevisionHistory = ({ revisionHistory, goToRevision, selectedKey, revision }) =>
  revisionHistory.length === 0 ? (
    <EmptyRevisionHistory data-comp="revision-history" data-no-changes>
      No recent changes found
    </EmptyRevisionHistory>
  ) : (
    <RevisionHistorySelect
      data-comp="revision-history"
      value={revision || revisionHistory[0]}
      onChange={e => goToRevision(selectedKey, e.target.value)}
    >
      {revisionHistory.map(item => <Revision key={item.sha} {...item} />)}
    </RevisionHistorySelect>
  );

const goToRevision = (key, sha) => push({ pathname: `/keys/${key}`, search: `?revision=${sha}` });

const mapStateToProps = ({ selectedKey: { key: selectedKey } }) => ({ selectedKey });

export default connect(mapStateToProps, { goToRevision })(RevisionHistory);
