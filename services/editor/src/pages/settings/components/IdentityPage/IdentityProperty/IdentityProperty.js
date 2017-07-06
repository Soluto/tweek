import React from 'react';
import './IdentityProperty.css';
import ComboBox from '../../../../../components/common/ComboBox/ComboBox';
import Input from '../../../../../components/common/Input/Input';
import Label from '../../../../../components/common/Label/Label';
import * as TypesServices from '../../../../../services/types-service';
import { compose, withState, withHandlers } from 'recompose';
import R from 'ramda';
import { WithContext as ReactTags } from 'react-tag-input';

const TypeCombobox = ({ type, onUpdate, allowedTypes }) =>
  <ComboBox
    value={type}
    filterBy={() => true}
    onChange={propType => onUpdate(propType)}
    suggestions={allowedTypes}
  />;

const SimpleTypeSelector = ({ type, onUpdate }) =>
  <TypeCombobox
    allowedTypes={[...Object.keys(TypesServices.types), 'Custom']}
    type={type}
    onUpdate={type => onUpdate(type === 'Custom' ? { base: 'string', allowedValues: [] } : type)}
  />;

const AdvancedTypeSelector = ({ type, onUpdate }) =>
  <div style={{ display: 'column', flexDirection: 'row' }}>
    <SimpleTypeSelector type={'Custom'} onUpdate={type => onUpdate(type)} />
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <Label text="Base" />
      <TypeCombobox
        type={type.base}
        allowedTypes={Object.keys(TypesServices.types)}
        onUpdate={base => onUpdate({ ...type, base })}
      />
    </div>
    <div
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
  </div>;

const PropertyTypeSelector = ({ type, onUpdate }) => {
  const TypeSelector = typeof type === 'object' ? AdvancedTypeSelector : SimpleTypeSelector;
  return <TypeSelector type={type} onUpdate={onUpdate} />;
};

export const IdentityPropertyItem = ({ name, def, onUpdate, onRemove }) =>
  <div data-comp="property-item">
    <button data-comp="remove" onClick={onRemove} />
    <Label text={name} />
    <PropertyTypeSelector type={def.type} onUpdate={type => onUpdate({ ...def, type })} />
  </div>;

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
    <div data-comp="new-property-item" onKeyDownCapture={e => e.keyCode === 13 && applyChange()}>
      <Input placeholder="Add new property" value={state.propName} onChange={updatePropName} />
      <PropertyTypeSelector
        type={state.def.type}
        onUpdate={type => updateDef({ ...state.def, type })}
      />
      <button data-comp="add" onClick={applyChange} />
    </div>
  );
});
