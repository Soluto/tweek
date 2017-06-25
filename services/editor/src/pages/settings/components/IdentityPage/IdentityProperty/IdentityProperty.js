import React from 'react';
import './IdentityProperty.css';
import ComboBox from '../../../../../components/common/ComboBox/ComboBox';
import * as TypesServices from '../../../../../services/types-service';
import { compose, withState, withHandlers } from 'recompose';
import R from 'ramda';

const PropertyTypeName = ({ name }) =>
  <span className="property-type-name-label">
    {name}
  </span>;

const PropertyTypeSelector = ({ type, onUpdate }) => {
  const suggestions = [...Object.keys(TypesServices.types)];
  return (
    <ComboBox
      value={type}
      filterBy={() => true}
      valueType="string"
      onChange={propType => onUpdate(propType)}
      suggestions={suggestions}
    />
  );
};

export const IdentityPropertyItem = ({ name, def, onUpdate }) =>
  <div className="property-type-wrapper">
    <PropertyTypeName name={name} />
    <PropertyTypeSelector type={def.type} onUpdate={type => onUpdate({ ...def, type })} />
  </div>;

const createUpdater = (propName, updateFn) => x => updateFn(R.assoc(propName, x));

const EMPTY_IDENTITY = { propName: '', def: { type: 'string' } };

export const NewIdentityProperty = compose(
  withState('state', 'setState', EMPTY_IDENTITY),
  withHandlers({
    updatePropName: ({ setState }) => createUpdater('propName', setState),
    updateDef: ({ setState }) => createUpdater('def', setState),
    clear: ({ setState }) => () => setState(() => EMPTY_IDENTITY),
  }),
)(({ state, updateDef, updatePropName, onCreate, clear }) =>
  <div className="new-identity-property">
    <input type="text" value={state.propName} onChange={e => updatePropName(e.target.value)} />
    <PropertyTypeSelector
      type={state.def.type}
      onUpdate={type => updateDef({ ...state.def, type })}
    />
    <button
      onClick={() => {
        onCreate(state.propName, state.def);
        clear();
      }}
    >
      Add
    </button>
  </div>,
);
