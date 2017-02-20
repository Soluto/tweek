import React from 'react';
import style from './styles.css';
import { WithContext as ReactTags } from 'react-tag-input';
import R from 'ramda';
import ComboBox from '../../../../../../../../../components/common/ComboBox/ComboBox';

const TagsPropertyValue = ({ onUpdate, value, suggestions }) => {
  let indexedTags = value.map(x => ({ id: x, text: x }));

  const handleAddtion = (newValue) => onUpdate([...value, newValue]);
  const handleDelete = (valueIndex) => onUpdate(R.remove(valueIndex, 1, value));
  const indexedSuggestions = suggestions ? suggestions.map(x => x) : [];

  return (
    <div className={style['tags-wrapper']}>
      <ReactTags tags={ indexedTags }
        suggestions={indexedSuggestions}
        handleAddition={handleAddtion}
        handleDelete={handleDelete}
        placeholder="Add value"
        minQueryLength = { 1 }
        allowDeleteFromEmptyInput={true}
        classNames={{
          tags: style['tags-container'],
          tagInput: style['tag-input'],
          tag: style['tag'],
          remove: style['tag-delete-button'],
          suggestions: style['tags-suggestion'],
        } }
      />
    </div>
  );
};

const InputPropertyValue = ({ onUpdate, value }) => (
  <input className={style['value-input']}
    type="text"
    onChange={(e) => onUpdate(e.target.value)}
    value={value}
    placeholder="Value"
  />
);

function PropertyValueComponent({ onUpdate, typeDetails, value, op }) {
  let allowedValues = typeDetails.allowedValues || [];

  if (op === '$in')
    return (
      <TagsPropertyValue onUpdate={onUpdate}
        value={value}
        suggestions={allowedValues}
      />
    );

  if (allowedValues.length > 0)
    return (
      <ComboBox
        options={ allowedValues }
        placeholder="Value"
        wrapperThemeClass={style['property-value-combo-box']}
        onChange={(selectedValue) => { onUpdate(selectedValue); } }
        selected={[R.find(x => x === value)(allowedValues)]}
      />
    );

  return (
    <InputPropertyValue onUpdate={onUpdate}
      value={value}
    />
  );
}

export default (props) => <div className={style['property-value-wrapper']}>
  <PropertyValueComponent {...props} />
</div>;
