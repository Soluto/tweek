import PropTypes from 'prop-types';
import { Observable } from 'rxjs';
import { compose, createEventHandler, mapPropsStream } from 'recompose';
import withSearchConfig from '../../../hoc/with-search-config';
import ComboBox from './ComboBox';

const mapSuggestionsToProps = compose(
  withSearchConfig,
  mapPropsStream((props$) => {
    const { handler: onSearch, stream: onSearch$ } = createEventHandler();

    const query$ = Observable.merge(onSearch$, props$.pluck('value'));

    const suggestions$ = query$
      .debounce((query) => Observable.empty().delay(query === '' ? 0 : 500))
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
