import React from 'react';
import classnames from 'classnames';
import Input from '../../../../components/common/Input/Input';
import TypedInput from '../../../../components/common/Input/TypedInput';
import { getPropertyTypeDetails } from '../../../../services/context-service';
import style from './IdentityProperties.css';

const getPropertyValueType = property => getPropertyTypeDetails(property).name;

const Property = ({ property, value }) => (
  <div className={style['property-wrapper']}>
    <Input className={style['property-input']} value={property} disabled />
    <TypedInput
      className={style['property-input']}
      value={value}
      valueType={getPropertyValueType(property)}
      placeholder="(no value)"
      disabled
    />
  </div>
);

const IdentityProperties = ({ className, properties }) => (
  <div className={classnames(style['context-properties-container'], className)}>
    <div className={style['context-properties-title']}>Properties</div>
    <div className={style['property-list']}>
      {
        Object.keys(properties).map(prop => <Property property={prop} value={properties[prop]} />)
      }
    </div>
  </div>
);

export default IdentityProperties;
