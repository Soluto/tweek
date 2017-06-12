import React from 'react';
import Rx from 'rxjs';
import { mapPropsStream } from 'recompose';
import * as ContextService from '../../../../../services/context-service';
import * as TypesService from '../../../../../services/types-service';
import {
  equal,
  inOp,
  allOperators,
  getPropertySupportedOperators,
} from '../../../../../services/operators-provider';
import Operator from './Operator';
import PropertyValue from './PropertyValue';

const translateValue = (oldOperator, newOperator, value) => {
  if (oldOperator.operatorValue === inOp.operatorValue) return value.length > 0 ? value[0] : '';
  if (newOperator.operatorValue === inOp.operatorValue) return value ? [value] : [];
  return value;
};

const propertyTypeDetailsToComparer = propertyTypeDetails =>
  propertyTypeDetails.comparer ? { $compare: propertyTypeDetails.comparer } : {};

const PropertyPredicate = ({
  mutate,
  supportedOperators,
  selectedOperator,
  propertyTypeDetails,
  predicateValue,
}) =>
  <div style={{ display: 'flex' }}>
    <Operator
      supportedOperators={supportedOperators}
      selectedOperator={selectedOperator}
      onUpdate={newOperator =>
        mutate.updateValue(
          newOperator.getValue(
            translateValue(selectedOperator, newOperator, predicateValue),
            propertyTypeDetailsToComparer(propertyTypeDetails),
          ),
        )}
    />
    <PropertyValue
      propertyTypeDetails={propertyTypeDetails}
      value={predicateValue}
      selectedOperator={selectedOperator.operatorValue}
      onUpdate={newPropertyValue =>
        mutate.updateValue(
          selectedOperator.getValue(
            newPropertyValue,
            propertyTypeDetailsToComparer(propertyTypeDetails),
          ),
        )}
    />
  </div>;

export default mapPropsStream((props$) => {
  const typeDetails$ = props$
    .map(x => x.property)
    .distinctUntilChanged()
    .switchMap(async (property) => {
      if (property.startsWith(ContextService.KEYS_IDENTITY)) {
        return await TypesService.getValueTypeDefinition(
          property.substring(ContextService.KEYS_IDENTITY.length),
        );
      }
      return ContextService.getPropertyTypeDetails(property);
    });

  return Rx.Observable
    .combineLatest(props$, typeDetails$)
    .map(([{ property, predicate, ...props }, propertyTypeDetails]) => {
      const supportedOperators = getPropertySupportedOperators(propertyTypeDetails);
      let predicateValue;
      let selectedOperator;
      if (typeof predicate !== 'object') {
        selectedOperator = supportedOperators.indexOf(equal) >= 0 ? equal : supportedOperators[0];
        predicateValue = predicate;
      } else {
        selectedOperator = allOperators.find(x =>
          Object.keys(predicate).find(predicateProperty => predicateProperty === x.operatorValue),
        );
        predicateValue = predicate[selectedOperator.operatorValue];
      }
      return { supportedOperators, selectedOperator, propertyTypeDetails, predicateValue, ...props };
    });
})(PropertyPredicate);
