import React from 'react';
import * as R from 'ramda';
import { compose, mapProps } from 'recompose';
import Chance from 'chance';
import CustomSlider from '../../../../components/common/CustomSlider/CustomSlider';
import TypedInput from '../../../../components/common/Input/TypedInput';
import ComboBox from '../../../../components/common/ComboBox/ComboBox';
import * as TypesService from '../../../../services/types-service';
import { convertWeightedArgsToArray } from '../../rules-utils';
import './RuleValue.css';

const chance = new Chance();

function replaceNaN(fallbackValue) {
  return isNaN(this) ? fallbackValue : this;
}
const parseNumericInput = inputValue => (inputValue === '' ? 0 : parseInt(inputValue, 10));
const wrapWithClass = propToClassNameFn => Comp => props => (
  <div className={propToClassNameFn(props)}>
    <Comp {...props} />
  </div>
);

export const InputValue = wrapWithClass(
  ({ valueType }) => `inputValue input-type-${valueType.name}`,
)(TypedInput);

const MultiVariantConverter = ({ valueType, identities, mutate, value, keyPath }) => {
  const convertToMultiVariant = valueDistribution =>
    mutate.apply((m) => {
      m
        .delete()
        .in('Type')
        .updateValue('MultiVariant')
        .up()
        .insert('OwnerType', identities[0])
        .insert('ValueDistribution', valueDistribution);

      const rule = m.up();
      const ruleValue = rule.getValue();
      if ('Id' in ruleValue) {
        rule.in('Id').updateKey('Salt');
      } else if (!('Salt' in ruleValue)) {
        rule.insert('Salt', chance.guid());
      }

      return m;
    });

  if (valueType.name === TypesService.types.boolean.name) {
    return (
      <button
        data-comp="convert-to-multi-variant"
        className="to-feature-flag-button"
        onClick={() =>
          convertToMultiVariant({
            type: 'bernoulliTrial',
            args: 0.1,
          })
        }
      >
        Gradual release
      </button>
    );
  }

  return (
    <button
      data-comp="convert-to-multi-variant"
      className="add-variant-button"
      onClick={() =>
        convertToMultiVariant({
          type: 'weighted',
          args: [
            {
              value,
              weight: 50,
            },
            {
              value: 'New Variant',
              weight: 50,
            },
          ],
        })
      }
    >
      Add Variant
    </button>
  );
};

const SingleVariantValue = ({ value, mutate, identities, autofocus, valueType, keyPath }) => (
  <div className="rule-value-container">
    <InputValue
      {...{ value, valueType }}
      data-comp="rule-value"
      onChange={newValue => mutate.updateValue(newValue)}
    />
    <MultiVariantConverter {...{ value, valueType, mutate, identities, keyPath }} />
  </div>
);

const multiVariantSliderColors = [
  ...['#ccf085', '#bebebe', '#c395f6', '#ef7478', '#5a8dc3', '#6e6e6e'],
  ...R.range(1, 30).map(_ => chance.color()),
];

const WeightedValues = ({ onUpdate, variants, valueType }) => (
  <CustomSlider
    data={convertWeightedArgsToArray(variants, valueType)}
    onUpdate={onUpdate}
    displaySliderDragger={false}
    sliderColors={multiVariantSliderColors}
    valueType={valueType}
  />
);

const bernouliTrialSliderColors = ['#007acc', 'lightGray'];
const BernoulliTrial = ({ onUpdate, ratio }) => (
  <div className="bernoulli-trial-container">
    <div className="bernoulli-trial-input-wrapper">
      <label>Open to</label>
      <input
        type="text"
        data-comp="bernoulli-trial-input"
        className="bernoulli-trial-input"
        value={+(ratio * 100).toFixed(2)}
        onChange={(e) => {
          const newValue = e.target.value;
          if (newValue < 0 || newValue > 100) {
            e.stopPropagation();
            return;
          }
          onUpdate(parseNumericInput(newValue) * replaceNaN.call(0.01, ratio));
        }}
        onWheel={({ deltaY, target }) => {
          const currentValue = parseNumericInput(target.value);
          let newValue = deltaY < 0 ? currentValue + 1 : currentValue - 1;
          newValue = Math.max(0, Math.min(100, newValue));
          onUpdate(newValue / 100);
        }}
      />
      <label>%</label>
    </div>
    <div className="bernoulli-trial-slider-wrapper">
      <CustomSlider
        displayLegend={false}
        sliderColors={bernouliTrialSliderColors}
        data={[
          { value: true, weight: 1000 * ratio / 10 },
          { value: false, weight: 100 - 1000 * ratio / 10 },
        ]}
        onUpdate={x => onUpdate(x[0].weight / 100)}
        valueType={TypesService.types['boolean']}
      />
    </div>
  </div>
);

const IdentitySelection = ({ identities, onChange, ownerType }) => (
  <div className="identity-selection-container">
    <label className="identity-selection-title">Identity: </label>
    <ComboBox
      data-comp="identity-selection"
      className="identity-selection-combobox-wrapper"
      suggestions={identities}
      onChange={(_, e) => e && onChange(e)}
      value={ownerType}
    />
  </div>
);

const MultiVariantValue = ({
  ValueDistribution: { type, args },
  mutate,
  identities,
  ownerType,
  valueType,
}) => {
  const updateOwnerType = identity =>
    mutate
      .up()
      .in('OwnerType')
      .updateValue(identity);
  const wrapperProps = {
    'data-type': type,
    'data-comp': 'multi-variant-value',
  };

  if (type === 'weighted') {
    return (
      <div {...wrapperProps}>
        <IdentitySelection
          ownerType={ownerType}
          identities={identities}
          onChange={updateOwnerType}
        />
        <WeightedValues
          variants={args}
          valueType={valueType}
          onUpdate={(variants) => {
            if (variants.length !== 1) {
              mutate.in('args').updateValue(variants);
              return;
            }

            const newValue = variants[0].value;
            mutate.apply(m =>
              m
                .up()
                .in('Value')
                .updateValue(newValue)
                .up()
                .in('Type')
                .updateValue('SingleVariant')
                .up()
                .in('ValueDistribution')
                .delete()
                .in('OwnerType')
                .delete(),
            );
          }}
        />
      </div>
    );
  }
  if (type === 'bernoulliTrial') {
    return (
      <div {...wrapperProps}>
        <IdentitySelection
          ownerType={ownerType}
          identities={identities}
          onChange={updateOwnerType}
        />

        <div style={{ marginTop: 5 }}>
          <BernoulliTrial onUpdate={mutate.in('args').updateValue} ratio={args} />

          {args === 1 ? (
            <button
              data-comp="set-to-true"
              className="set-to-true-button"
              onClick={() =>
                mutate.apply(m =>
                  m
                    .up()
                    .in('Value')
                    .updateValue('true')
                    .up()
                    .in('Type')
                    .updateValue('SingleVariant')
                    .up()
                    .in('ValueDistribution')
                    .delete()
                    .in('OwnerType')
                    .delete(),
                )
              }
            >
              Set to true
            </button>
          ) : null}

          {args === 0 ? (
            <button
              className="set-to-false-button"
              onClick={() =>
                mutate.apply(m =>
                  m
                    .up()
                    .in('Value')
                    .updateValue('false')
                    .up()
                    .in('Type')
                    .updateValue('SingleVariant')
                    .up()
                    .in('ValueDistribution')
                    .delete()
                    .in('OwnerType')
                    .delete(),
                )
              }
            >
              Set to false
            </button>
          ) : null}
        </div>
      </div>
    );
  }
  return null;
};

const RuleValue = ({ rule, mutate, valueType, autofocus, identities, keyPath }) => {
  if (rule.Type === 'SingleVariant') {
    return (
      <SingleVariantValue
        mutate={mutate.in('Value')}
        value={rule.Value}
        {...{ identities, autofocus, valueType, keyPath }}
      />
    );
  }

  if (rule.Type === 'MultiVariant') {
    return (
      <MultiVariantValue
        mutate={mutate.in('ValueDistribution')}
        ValueDistribution={rule.ValueDistribution}
        ownerType={rule.OwnerType}
        {...{ identities, valueType }}
      />
    );
  }

  return null;
};

RuleValue.displayName = 'RuleValue';

export default RuleValue;
