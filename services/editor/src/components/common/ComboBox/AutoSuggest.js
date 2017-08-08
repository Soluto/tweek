import PropTypes from 'prop-types';
import Rx from 'rxjs';
import { mapPropsStream } from 'recompose';
import ComboBox from './ComboBox';

const mapSuggestionsToProps = mapPropsStream((props$) => {
  const suggestions$ = props$
    .distinctUntilKeyChanged('value')
    .debounce(({ value }) => Rx.Observable.interval(value === '' ? 1 : 500))
    .switchMap(({ getSuggestions, value }) =>
      Rx.Observable.defer(() => Promise.resolve(getSuggestions(value))),
    )
    .startWith([]);

  return Rx.Observable
    .combineLatest(props$, suggestions$)
    .map(([{ getSuggestions, ...props }, suggestions]) => ({
      ...props,
      suggestions,
    }));
});

const AutoSuggest = mapSuggestionsToProps(ComboBox);

AutoSuggest.propTypes = {
  getSuggestions: PropTypes.func.isRequired,
};

AutoSuggest.displayName = 'AutoSuggest';

export default AutoSuggest;
