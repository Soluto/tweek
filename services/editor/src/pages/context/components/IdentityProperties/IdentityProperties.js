import React from 'react';
import classnames from 'classnames';
import Input from '../../../../components/common/Input/Input';
import TypedInput from '../../../../components/common/Input/TypedInput';
import { getPropertyTypeDetails } from '../../../../services/context-service';
import './IdentityProperties.css';

const getPropertyValueType = (identityName, property) => {
  const details = getPropertyTypeDetails(`${identityName}.${property}`);
  return details.name;
};

const Property = ({ identityName, property, value }) =>
  <div className={'property-wrapper'}>
    <Input className={'property-input'} value={property} disabled />
    <TypedInput
      className={'property-input'}
      value={value}
      valueType={getPropertyValueType(identityName, property)}
      placeholder="(no value)"
      disabled
    />
  </div>;

const IdentityProperties = ({ className, identityName, properties }) =>
  <div className={classnames('context-properties-container', className)}>
    <div className={'context-properties-title'}>Properties</div>
    <div className={'property-list'}>
      {Object.keys(properties).map(prop =>
        <Property
          key={prop}
          identityName={identityName}
          property={prop}
          value={properties[prop]}
        />,
      )}
    </div>
  </div>;

export default IdentityProperties;
