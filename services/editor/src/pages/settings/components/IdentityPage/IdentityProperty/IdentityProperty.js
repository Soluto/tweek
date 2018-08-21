import React from 'react';
import { compose, withState, withHandlers } from 'recompose';
import * as R from 'ramda';
import ComboBox from '../../../../../components/common/ComboBox/ComboBox';
import Input from '../../../../../components/common/Input/Input';
import TypedInput from '../../../../../components/common/Input/TypedInput';
import Label from '../../../../../components/common/Label/Label';
import * as TypesServices from '../../../../../services/types-service';
import './IdentityProperty.css';

const TypeCombobox = ({ type, onUpdate, allowedTypes }) => (
  <ComboBox
    data-comp="type-select"
    value={type}
    filterBy={() => true}
    onChange={propType =>
      onUpdate(propType === TypesServices.types.array.name ? CreateBaseArray() : propType)
    }
    suggestions={allowedTypes}
  />
);

const IdentityPropertyTypes = [...Object.keys(TypesServices.types)];
const CreateBaseArray = () => ({
  name: TypesServices.types.array.name,
  ofType: { base: TypesServices.types.string.name },
});

const SimpleTypeSelector = ({ type, onUpdate }) => (
  <div className={'simple-property'}>
    <TypeCombobox
      allowedTypes={IdentityPropertyTypes}
      type={type}
      onUpdate={newType => (newType !== type ? onUpdate(newType) : null)}
    />
    <button data-comp="advanced" onClick={() => onUpdate({ base: type, allowedValues: [] })}>
      ...
    </button>
  </div>
);

const AdvancedTypeSelector = ({ type, onUpdate }) => (
  <div style={{ display: 'column', flexDirection: 'row' }}>
    <TypeCombobox
      allowedTypes={IdentityPropertyTypes}
      type={type.name || type.base}
      onUpdate={type => onUpdate(type)}
    />
    <div
      data-field="allowed-values"
      data-comp="editable-list"
      style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end' }}
    >
      <Label text="Allowed Values" />
      <TypedInput
        data-comp="property-value"
        hideIcon
        valueType={{ ...TypesServices.types.array, ofType: type.ofType || type.base }}
        value={type.allowedValues}
        onChange={allowedValues => onUpdate({ ...type, allowedValues: allowedValues })}
      />
    </div>
  </div>
);

const ArrayTypeSelector = ({ type, onUpdate }) => {
  const { allowedValues, ...baseOfType } = type.ofType;
  return (
    <div style={{ display: 'column', flexDirection: 'row' }}>
      <TypeCombobox
        allowedTypes={IdentityPropertyTypes}
        type={type.name || type.base}
        onUpdate={type => onUpdate(type)}
      />
      <div data-field="base" style={{ display: 'flex', flexDirection: 'row' }}>
        <Label text="Generic Type" />
        <TypeCombobox
          type={type.ofType.base}
          allowedTypes={R.reject(R.contains(R.__, ['array', 'object']), IdentityPropertyTypes)}
          onUpdate={ofType => onUpdate({ ...type, ofType: { base: ofType } })}
        />
      </div>
      <div
        data-field="allowed-values"
        data-comp="editable-list"
        style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end' }}
      >
        <Label text="Allowed Values" />
        <TypedInput
          data-comp="property-value"
          hideIcon
          valueType={{ ...TypesServices.types.array, ofType: { ...baseOfType } }}
          value={type.ofType.allowedValues}
          onChange={allowedValues =>
            onUpdate({ ...type, ofType: { ...type.ofType, allowedValues: allowedValues } })
          }
        />
      </div>
    </div>
  );
};

const PropertyTypeSelector = ({ type, onUpdate, ...props }) => {
  const TypeSelector =
    typeof type === 'object'
      ? type.ofType ? ArrayTypeSelector : AdvancedTypeSelector
      : SimpleTypeSelector;
  return (
    <div data-comp="PropertyTypeSelect" {...props}>
      <TypeSelector type={type} onUpdate={onUpdate} />
    </div>
  );
};

export const IdentityPropertyItem = ({ name, def, onUpdate, onRemove }) => (
  <div data-comp="property-item" data-property-name={name}>
    <button data-comp="remove" onClick={onRemove} />
    <Label text={name} />
    <PropertyTypeSelector
      data-field="property-type"
      type={def.type}
      onUpdate={type => onUpdate({ ...def, type })}
    />
  </div>
);

const createUpdater = (propName, updateFn) => x => updateFn(R.assoc(propName, x));
const EMPTY_PROPERTY = { propName: '', def: { type: 'string' } };
export const NewIdentityProperty = compose(
  withState('state', 'setState', EMPTY_PROPERTY),
  withHandlers({
    updatePropName: ({ setState }) => createUpdater('propName', setState),
    updateDef: ({ setState }) => createUpdater('def', setState),
    clear: ({ setState }) => () => setState(() => EMPTY_PROPERTY),
  }),
)(({ state, updateDef, updatePropName, onCreate, clear }) => {
  let applyChange = () => {
    onCreate(state.propName, state.def);
    clear();
  };
  return (
    <div
      data-comp="new-property-item"
      onKeyUpCapture={(e) => {
        if (e.keyCode !== 13) return;
        if (state.propName === '') return;
        if (typeof state.def.type === 'object') return;
        applyChange();
      }}
    >
      <Input
        data-field="property-name"
        placeholder="Add new property"
        value={state.propName}
        onChange={updatePropName}
      />
      <PropertyTypeSelector
        data-field="property-type"
        type={state.def.type}
        onUpdate={type => updateDef({ ...state.def, type })}
      />
      <button data-comp="add" onClick={applyChange} />
    </div>
  );
});
