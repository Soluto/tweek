import React from 'react';
import classnames from 'classnames';
import * as R from 'ramda';
import TypedInput from '../../../../components/common/Input/TypedInput';
import { getPropertyTypeDetails } from '../../../../services/context-service';
import './IdentityProperties.css';

const Property = ({ identityType, property, local, remote, onChange }) => {
  const valueType = getPropertyTypeDetails(`${identityType}.${property}`);
  return (
    <div className="property-wrapper" data-comp="identity-property" data-property={property}>
      <label className="property-label">{property}</label>
      <TypedInput
        data-field="value"
        className={classnames('value-input', {
          'has-changes': remote !== local,
        })}
        value={local}
        onChange={onChange}
        valueType={valueType}
        isArray={valueType.name === 'array'}
        placeholder="(no value)"
        disabled={property.startsWith('@')}
      />
      <div className="initial-value" title={remote}>
        {remote === local ? null : remote}
      </div>
    </div>
  );
};

const IdentityProperties = ({ className, identityType, local, remote, updateContext }) => (
  <div
    className={classnames('identity-properties-container', className)}
    data-comp="identity-properties"
  >
    <div className="identity-properties-title">Properties</div>
    <div className="property-list">
      {Object.keys(remote).map(prop => (
        <Property
          key={prop}
          identityType={identityType}
          property={prop}
          local={local[prop]}
          remote={remote[prop]}
          onChange={value =>
            updateContext(value === '' ? R.dissoc(prop, local) : R.assoc(prop, value, local))
          }
        />
      ))}
    </div>
  </div>
);

export default IdentityProperties;
