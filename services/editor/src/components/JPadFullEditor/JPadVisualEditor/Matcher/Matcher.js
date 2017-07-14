import React from 'react';
import R from 'ramda';
import { shouldUpdate } from 'recompose';
import * as ContextService from '../../../../services/context-service';
import PropertyName from './Properties/PropertyName';
import PropertyPredicate from './Properties/PropertyPredicate';
import './Matcher.css';

const Property = ({
  property,
  predicate,
  mutate,
  suggestedValues = [],
  canBeClosed = true,
  autofocus,
}) =>
  <div className={'condition-wrapper'}>
    <button
      onClick={mutate.delete}
      className={'delete-condition-button'}
      title="Remove condition"
      disabled={!canBeClosed}
    />
    <PropertyName {...{ property, mutate, suggestedValues, autofocus }} />
    <PropertyPredicate {...{ predicate, mutate, property }} />
  </div>;

const hasChanged = shouldUpdate(
  (props, nextProps) =>
    !R.equals(props.matcher, nextProps.matcher) ||
    !R.equals(props.mutate.path, nextProps.mutate.path),
);

export default hasChanged(({ matcher, mutate, autofocus }) => {
  const [ops, props] = R.pipe(R.toPairs, R.partition(([prop]) => prop[0] === '$'))(matcher);
  const ignoreActivePropsPropsPredicate = R.compose(R.not, R.contains(R.__, R.map(R.head, props)));

  const allSuggestions = ContextService.getProperties().map(prop => ({
    label: prop.name,
    value: prop.id,
  }));

  const filterActiveProps = currentProp =>
    allSuggestions.filter(x => x.value === currentProp || ignoreActivePropsPropsPredicate(x.value));

  return (
    <div className={'matcher'}>
      {props.length === 0
        ? <h3 className={'empty-matcher-watermark'}>Match all</h3>
        : props.map(([property, predicate], i) => {
            const suggestedValues = filterActiveProps(property);
            return (
              <Property
                key={i}
                mutate={mutate.in(property)}
                {...{ suggestedValues, property, predicate, autofocus }}
              />
            );
          })}
      <button
        className={'add-condition-button'}
        onClick={() => mutate.insert('', '')}
        title="Add condition"
      />
    </div>
  );
});
