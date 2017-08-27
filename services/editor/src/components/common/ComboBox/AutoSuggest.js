import PropTypes from 'prop-types';
import Rx from 'rxjs';
import { createEventHandler, mapPropsStream } from 'recompose';
import ComboBox from './ComboBox';

const mapSuggestionsToProps = mapPropsStream((props$) => {
  const { handler: onSearch, stream: onSearch$ } = createEventHandler();

  const query$ = Rx.Observable.merge(onSearch$, props$.pluck('value'));

  const suggestions$ = query$
    .distinctUntilChanged()
    .withLatestFrom(props$.pluck('getSuggestions'), Array.of)
    .debounce(([value]) => Rx.Observable.empty().delay(value === '' ? 0 : 500))
    .switchMap(([value, getSuggestions]) =>
      Rx.Observable.defer(() => Promise.resolve(getSuggestions(value))),
    )
    .startWith([]);

  return Rx.Observable
    .combineLatest(props$, suggestions$)
    .map(([{ getSuggestions, onChange, ...props }, suggestions]) => ({
      ...props,
      suggestions,
      onChange: (txt, ...args) => {
        onSearch(txt);
        if (onChange) onChange(txt, ...args);
      },
    }));
});

const AutoSuggest = mapSuggestionsToProps(ComboBox);

AutoSuggest.propTypes = {
  getSuggestions: PropTypes.func.isRequired,
};

AutoSuggest.displayName = 'AutoSuggest';

export default AutoSuggest;
