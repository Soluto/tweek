import React from 'react';
import { compose, withState, withHandlers } from 'recompose';
import * as R from 'ramda';
import { WithContext as ReactTags } from 'react-tag-input';
import ComboBox from '../../../../../components/common/ComboBox/ComboBox';
import Input from '../../../../../components/common/Input/Input';
import Label from '../../../../../components/common/Label/Label';
import * as TypesServices from '../../../../../services/types-service';
import './IdentityProperty.css';

const TypeCombobox = ({ type, onUpdate, allowedTypes }) => (
  <ComboBox
    data-comp="type-select"
    value={type}
    filterBy={() => true}
    onChange={propType => onUpdate(propType)}
    suggestions={allowedTypes}
  />
);

const SimpleTypeSelector = ({ type, onUpdate }) => (
  <TypeCombobox
    allowedTypes={[...Object.keys(TypesServices.types), 'custom']}
    type={type}
    onUpdate={type => onUpdate(type === 'custom' ? { base: 'string', allowedValues: [] } : type)}
  />
);

const AdvancedTypeSelector = ({ type, onUpdate }) => (
  <div style={{ display: 'column', flexDirection: 'row' }}>
    <SimpleTypeSelector type={'custom'} onUpdate={type => onUpdate(type)} />
    <div data-field="base" style={{ display: 'flex', flexDirection: 'row' }}>
      <Label text="Base" />
      <TypeCombobox
        type={type.base}
        allowedTypes={Object.keys(TypesServices.types)}
        onUpdate={base => onUpdate({ ...type, base })}
      />
    </div>
    <div
      data-field="allowed-values"
      data-comp="editable-list"
      style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end' }}
    >
      <Label text="Allowed Values" />
      <ReactTags
        tags={type.allowedValues.map(v => ({ id: v, text: v })) || []}
        handleAddition={newValue =>
          onUpdate({ ...type, allowedValues: [...type.allowedValues, newValue] })}
        handleDelete={index =>
          onUpdate({ ...type, allowedValues: R.remove(index, 1, type.allowedValues) })}
        placeholder="Add value"
        allowDeleteFromEmptyInput
        classNames={{
          tags: 'tags-container',
          tagInput: 'tag-input',
          tag: 'tag',
          remove: 'tag-delete-button',
          suggestions: 'tags-suggestion',
        }}
      />
    </div>
  </div>
);

const PropertyTypeSelector = ({ type, onUpdate, ...props }) => {
  const TypeSelector = typeof type === 'object' ? AdvancedTypeSelector : SimpleTypeSelector;
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
