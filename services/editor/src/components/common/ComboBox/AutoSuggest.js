import PropTypes from 'prop-types';
import { Observable } from 'rxjs';
import { compose, createEventHandler, mapPropsStream } from 'recompose';
import { withTweekKeys } from '../../../contexts/Tweek';
import ComboBox from './ComboBox';

const mapSuggestionsToProps = compose(
  withTweekKeys({
    maxSearchResults: '@tweek/editor/search/max_results',
    showInternalKeys: '@tweek/editor/show_internal_keys',
  }),
  mapPropsStream((props$) => {
    const { handler: onSearch, stream: onSearch$ } = createEventHandler();

    const query$ = Observable.merge(onSearch$, props$.pluck('value'));

    const suggestions$ = query$
      .debounce(query => Observable.empty().delay(query === '' ? 0 : 500))
      .distinctUntilChanged()
      .withLatestFrom(props$)
      .switchMap(([value, { getSuggestions, maxSearchResults, showInternalKeys }]) =>
        Observable.defer(() =>
          Promise.resolve(getSuggestions(value, { maxSearchResults, showInternalKeys })),
        ),
      )
      .startWith([]);

    return Observable.combineLatest(props$, suggestions$).map(
      ([{ getSuggestions, maxSearchResults, onChange, ...props }, suggestions]) => ({
        ...props,
        suggestions,
        onChange: (txt, ...args) => {
          onSearch(txt);
          if (onChange) onChange(txt, ...args);
        },
      }),
    );
  }),
);

const AutoSuggest = mapSuggestionsToProps(ComboBox);

AutoSuggest.propTypes = {
  getSuggestions: PropTypes.func.isRequired,
};

AutoSuggest.displayName = 'AutoSuggest';

export default AutoSuggest;
