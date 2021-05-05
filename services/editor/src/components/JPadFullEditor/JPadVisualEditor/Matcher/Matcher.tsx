import { equals } from 'ramda';
import React, { memo } from 'react';
import * as ContextService from '../../../../services/context-service';
import { ComplexValue } from '../../../../services/operators-provider';
import { AnyMutator } from '../../../../utils/mutator';
import { Matcher as MatcherType, Rule } from '../../types';
import './Matcher.css';
import { Suggestion } from './Properties/PropertyComboBox';
import PropertyName from './Properties/PropertyName';
import PropertyPredicate from './Properties/PropertyPredicate';

type ConditionProps = {
  property: string;
  predicate: ComplexValue<string> | unknown;
  mutate: AnyMutator<Rule[], [number, 'Matcher', string]>;
  suggestedValues: Suggestion[];
  canBeClosed?: boolean;
  autofocus?: boolean;
};

const Condition = ({
  property,
  predicate,
  mutate,
  suggestedValues = [],
  canBeClosed = true,
  autofocus,
}: ConditionProps) => (
  <div className="condition-wrapper" data-comp="condition" data-property={property}>
    <button
      onClick={mutate.delete}
      data-comp="delete-condition"
      className="delete-condition-button"
      title="Remove condition"
      disabled={!canBeClosed}
    />
    <PropertyName
      property={property}
      mutate={mutate}
      suggestedValues={suggestedValues}
      autofocus={autofocus}
    />
    <PropertyPredicate
      predicate={predicate}
      property={property}
      onChange={(value) => mutate.updateValue(value)}
    />
  </div>
);

export type MatcherProps = {
  mutate: AnyMutator<Rule[], [number, 'Matcher']>;
  autofocus?: boolean;
  matcher: MatcherType;
};

const Matcher = ({ matcher, mutate, autofocus }: MatcherProps) => {
  const props = Object.entries(matcher).filter(([p]) => !p.startsWith('$'));

  const allSuggestions = ContextService.getAllProperties().map((prop) => ({
    label: prop.name,
    value: prop.id,
  }));

  const filterActiveProps = (currentProp: string) =>
    allSuggestions.filter((x) => x.value === currentProp || !(x.value in matcher));

  return (
    <div className="matcher">
      {props.length === 0 ? (
        <h3 className="empty-matcher-watermark">Match all</h3>
      ) : (
        props.map(([property, predicate], i, arr) => {
          const suggestedValues = filterActiveProps(property);
          return (
            <Condition
              key={i}
              mutate={mutate.in(property)}
              suggestedValues={suggestedValues}
              property={property}
              predicate={predicate}
              autofocus={autofocus && i === arr.length - 1}
            />
          );
        })
      )}
      <button
        data-comp="add-condition"
        className="add-condition-button"
        onClick={() => mutate.insert('', '')}
        title="Add condition"
      />
    </div>
  );
};

export default memo(
  Matcher,
  (props, nextProps) =>
    equals(props.matcher, nextProps.matcher) && equals(props.mutate.path, nextProps.mutate.path),
);
