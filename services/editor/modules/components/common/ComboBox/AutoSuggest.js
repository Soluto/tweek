import { PropTypes } from 'react';
import Rx from 'rxjs';
import { createEventHandler, mapPropsStream } from 'recompose';
import ComboBox from './ComboBox';

const mapSuggestionsToProps = mapPropsStream((props$) => {
  const { handler: onSearch, stream: onSearch$ } = createEventHandler();

  const suggestions$ = Rx.Observable.combineLatest(props$, onSearch$.startWith(''))
    .map(([{ getSuggestions }, query]) => ({ getSuggestions, query }))
    .distinctUntilChanged(x => x.query)
    .debounceTime(500)
    .switchMap(({ getSuggestions, query }) => Promise.resolve(getSuggestions(query)))
    .startWith([]);

  return Rx.Observable.combineLatest(props$, suggestions$)
    .map(([{ getSuggestions, ...props }, suggestions]) => ({ ...props,
      suggestions,
      onChange: (txt) => {
        onSearch(txt);
        if (props.onChange) props.onChange(txt);
      } }));
});

const AutoSuggest = mapSuggestionsToProps(ComboBox);

AutoSuggest.propTypes = {
  getSuggestions: PropTypes.func.isRequired,
};

export default AutoSuggest;
