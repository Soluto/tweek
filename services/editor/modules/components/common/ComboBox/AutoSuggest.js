import { PropTypes } from 'react';
import Rx from 'rxjs';
import { createEventHandler, mapPropsStream } from 'recompose';
import ComboBox from './ComboBox';

const mapSuggestionsToProps = mapPropsStream((props$) => {
  const { handler: onSearch, stream: onSearch$ } = createEventHandler();

  const query$ = onSearch$.startWith('')
    .distinctUntilChanged()
    .debounceTime(500);

  const suggestions$ = Rx.Observable.combineLatest(props$, query$)
    .map(([{ getSuggestions }, query]) => ({ getSuggestions, query }))
    .switchMap(({ getSuggestions, query }) => Rx.Observable.defer(() => Promise.resolve(getSuggestions(query))))
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
