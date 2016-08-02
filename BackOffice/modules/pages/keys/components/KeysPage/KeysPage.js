import React from 'react';
import { Component } from 'react';
import * as actions from '../../ducks/keys';
import { connect } from 'react-redux';
import KeysList from '../KeysList/KeysList';
import style from './KeysPage.css';
import createFragment from 'react-addons-create-fragment';
import { withState, compose, mapProps, componentFromStream, createEventHandler } from 'recompose';
import Autosuggest from 'react-autosuggest';
import R from 'ramda';
import { inputKeyboardHandlers } from '../../../../utils/input';

const getKeyPrefix = (path) => R.slice(0, -1, path.split('/')).join('/');
const getSugesstions = R.pipe(R.map(getKeyPrefix), R.uniq(), R.filter(x => x !== ''));

const Add = compose(mapProps(({ keylist, ...props }) => ({ ...props, suggestions: getSugesstions(keylist).sort() })), withState('value', 'setValue', ''), withState('isAdding', 'setIsAdding', false))(({ onKeyAdded, suggestions, isAdding, value, setValue, setIsAdding }) => {
  if (!isAdding) return <button className={style['add-button']} onClick={() => setIsAdding(true) }>Add key</button>;
  return (<Autosuggest suggestions={suggestions}
    getSuggestionValue={(x) => x}
    renderSuggestion={x => <span>{x}</span>}
    inputProps={{
      value, ...inputKeyboardHandlers({ submit: (newValue) => {
        setIsAdding(false);
        onKeyAdded(newValue);
        setValue('');
      }, cancel: () => {
        setIsAdding(false);
        setValue('');
      } }), onChange: (_, { newValue }) => setValue(newValue),
    }}
  />);
});

export default connect(state => state, { ...actions })(class KeysPage extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if (!this.props.keys) {
      this.props.getKeys([]);
    }
  }

  render() {
    const { keys, addKey, children } = this.props;
    // <FilterTree keys={keys} />
    return (
      <div className={style['keys-page-container']}>
        {createFragment({
          KeysList: <div className={style['keys-list']}>
            <Add keylist={keys} onKeyAdded={addKey} />
            <KeysList keys={keys} />
          </div>,
          Page: <div className={style['key-page']}>
            {children}
          </div>,
        }) }
      </div>
    );
  }
});
