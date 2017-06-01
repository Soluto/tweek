import React, { PropTypes } from 'react';
import R from 'ramda';
import { withState } from 'recompose';
import classnames from 'classnames';
import AutoSuggest from './AutoSuggest';
import style from './MultiSourceComboBox.css';

const SourceTitle = ({ id, selectSourceId, sourceId }) => (
  <div
    onClick={() => selectSourceId(id)}
    disabled={id === sourceId}
    className={classnames(style['source-item'], { active: id === sourceId })}
  >
    {id === undefined ? 'All' : id}
  </div>
);

const MultiSourceComboBox = ({ getSuggestions, sourceId, selectSourceId, ...props }) => (
  <AutoSuggest
    getSuggestions={(...args) =>
      (getSuggestions[sourceId]
        ? getSuggestions[sourceId](...args)
        : R.pipe(R.values, R.chain(x => x(...args)))(getSuggestions))}
    suggestionsContainer={({ children }) => (
      <div className={style['multi-source-combo-box-suggestions']}>
        <div className={style['source-select']}>
          <SourceTitle {...{ sourceId, selectSourceId }} />
          {Object.keys(getSuggestions).map(key => (
            <SourceTitle id={key} {...{ key, sourceId, selectSourceId }} />
          ))}
        </div>
        <ul
          className="bootstrap-typeahead-menu dropdown-menu dropdown-menu-justify"
          style={{ display: 'block', overflow: 'auto', maxHeight: '300px', position: 'relative' }}
        >
          {children.length > 0 ? children : 'Not found...'}
        </ul>
      </div>
    )}
    {...props}
  />
);

MultiSourceComboBox.propTypes = {
  getSuggestions: PropTypes.objectOf(PropTypes.func).isRequired,
};

export default withState('sourceId', 'selectSourceId')(MultiSourceComboBox);
