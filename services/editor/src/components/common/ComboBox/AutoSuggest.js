import PropTypes from 'prop-types';
import { Observable } from 'rxjs';
import { createEventHandler, mapPropsStream } from 'recompose';
import ComboBox from './ComboBox';

const mapSuggestionsToProps = mapPropsStream((props$) => {
  const { handler: onSearch, stream: onSearch$ } = createEventHandler();

  const query$ = Observable.merge(onSearch$, props$.pluck('value'));

  const suggestions$ = query$
    .debounce(query => Observable.empty().delay(query === '' ? 0 : 500))
    .distinctUntilChanged()
    .withLatestFrom(props$.pluck('getSuggestions'), Array.of)
    .switchMap(([value, getSuggestions]) =>
      Observable.defer(() => Promise.resolve(getSuggestions(value))),
    )
    .startWith([]);

  return Observable.combineLatest(props$, suggestions$).map(
    ([{ getSuggestions, onChange, ...props }, suggestions]) => ({
      ...props,
      suggestions,
      onChange: (txt, ...args) => {
        onSearch(txt);
        if (onChange) onChange(txt, ...args);
      },
    }),
  );
});

const AutoSuggest = mapSuggestionsToProps(ComboBox);

AutoSuggest.propTypes = {
  getSuggestions: PropTypes.func.isRequired,
};

AutoSuggest.displayName = 'AutoSuggest';

export default AutoSuggest;
