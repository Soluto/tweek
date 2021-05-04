import Chance from 'chance';
import * as R from 'ramda';
import React from 'react';
import { ValueType } from 'tweek-client';
import * as TypesService from '../../../../services/types-service';
import { AnyMutator } from '../../../../utils/mutator';
import { ComboBox, CustomSlider, TypedInput } from '../../../common';
import { TypedInputProps } from '../../../common/Input/TypedInput';
import { convertWeightedArgsToArray } from '../../rules-utils';
import {
  ConditionValueType,
  DistributionType,
  Rule,
  ValueDistribution,
  WeightedDistributionArg,
} from '../../types';
import './RuleValue.css';

const chance = new Chance();

const parseNumericInput = (inputValue: string) =>
  inputValue === '' ? 0 : parseInt(inputValue, 10);

export type InputValueProps = Omit<TypedInputProps, 'valueType'> & { valueType: ValueType };

export const InputValue = ({ valueType, ...props }: InputValueProps) => (
  <div className={`inputValue input-type-${valueType.name}`}>
    <TypedInput valueType={valueType} {...props} />
  </div>
);

export type MultiVariantConverterProps = {
  value: any;
  valueType: ValueType;
  identities: string[];
  mutate: AnyMutator<Rule, ['Value']>;
};

const MultiVariantConverter = ({
  valueType,
  identities,
  mutate,
  value,
}: MultiVariantConverterProps) => {
  const convertToMultiVariant = (valueDistribution: ValueDistribution) =>
    mutate.apply((m) => {
      m.delete()
        .in('Type')
        .updateValue(ConditionValueType.MultiVariant)
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
            type: DistributionType.bernoulliTrial,
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
          type: DistributionType.weighted,
          args: [
            {
              value,
              weight: 50,
            },
            {
              value: valueType.emptyValue || 'New Variant',
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

const SingleVariantValue = ({
  value,
  mutate,
  identities,
  valueType,
}: MultiVariantConverterProps) => (
  <div className="rule-value-container">
    <InputValue
      value={value}
      valueType={valueType}
      data-comp="rule-value"
      onChange={(newValue: any) => mutate.updateValue(newValue)}
    />
    <MultiVariantConverter
      value={value}
      valueType={valueType}
      mutate={mutate}
      identities={identities}
    />
  </div>
);

const multiVariantSliderColors = [
  ...['#ccf085', '#bebebe', '#c395f6', '#ef7478', '#5a8dc3', '#6e6e6e'],
  ...R.range(1, 30).map(() => chance.color()),
];

export type WeightedValuesProps = {
  valueType: ValueType;
  onUpdate: (data: WeightedDistributionArg[]) => void;
  variants: WeightedDistributionArg[];
};

const WeightedValues = ({ onUpdate, variants, valueType }: WeightedValuesProps) => (
  <CustomSlider
    data={convertWeightedArgsToArray(variants, valueType)}
    onUpdate={onUpdate}
    displayLegend
    sliderColors={multiVariantSliderColors}
    valueType={valueType}
  />
);

const bernouliTrialSliderColors = ['#007acc', 'lightGray'];
export type BernoulliTrialProps = {
  ratio: number;
  onUpdate: (ratio: number) => void;
};
const BernoulliTrial = ({ onUpdate, ratio }: BernoulliTrialProps) => (
  <div className="bernoulli-trial-container">
    <div className="bernoulli-trial-input-wrapper">
      <label>Open to</label>
      <input
        type="text"
        data-comp="bernoulli-trial-input"
        className="bernoulli-trial-input"
        value={+(ratio * 100).toFixed(2)}
        onChange={(e) => {
          const newValue = parseNumericInput(e.target.value);
          if (newValue < 0 || newValue > 100 || isNaN(newValue)) {
            e.stopPropagation();
            return;
          }
          onUpdate(newValue * 0.01);
        }}
        onWheel={({ deltaY, target }) => {
          const currentValue = parseNumericInput((target as HTMLInputElement).value);
          let newValue = deltaY < 0 ? currentValue + 1 : currentValue - 1;
          newValue = Math.max(0, Math.min(100, newValue));
          onUpdate(newValue / 100);
        }}
      />
      <label>%</label>
    </div>
    <div className="bernoulli-trial-slider-wrapper">
      <CustomSlider
        displaySliderDragger
        sliderColors={bernouliTrialSliderColors}
        data={[
          { value: true, weight: 100 * ratio },
          { value: false, weight: 100 - 100 * ratio },
        ]}
        onUpdate={(x) => onUpdate(x[0].weight / 100)}
        valueType={TypesService.types.boolean}
      />
    </div>
  </div>
);

type IdentitySelectionProps = {
  identities: string[];
  ownerType: string;
  onChange: (owner: string) => void;
};

const IdentitySelection = ({ identities, onChange, ownerType }: IdentitySelectionProps) => (
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

type MultiVariantValueProps = {
  ValueDistribution: ValueDistribution;
  mutate: AnyMutator<Rule, ['ValueDistribution']>;
  identities: string[];
  ownerType: string;
  valueType: ValueType;
};

const MultiVariantValue = ({
  ValueDistribution: { type, args },
  mutate,
  identities,
  ownerType,
  valueType,
}: MultiVariantValueProps) => {
  const updateOwnerType = (identity: string) => mutate.up().in('OwnerType').updateValue(identity);
  const wrapperProps = {
    'data-type': type,
    'data-comp': 'multi-variant-value',
  };

  if (type === DistributionType.weighted) {
    return (
      <div {...wrapperProps}>
        <IdentitySelection
          ownerType={ownerType}
          identities={identities}
          onChange={updateOwnerType}
        />
        <WeightedValues
          variants={args as WeightedDistributionArg[]}
          valueType={valueType}
          onUpdate={(variants) => {
            if (variants.length !== 1) {
              mutate.in('args').updateValue(variants);
              return;
            }

            const newValue = variants[0].value;
            mutate.apply((m) =>
              m
                .up()
                .in('Value')
                .updateValue(newValue)
                .up()
                .in('Type')
                .updateValue(ConditionValueType.SingleVariant)
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
  if (type === DistributionType.bernoulliTrial) {
    return (
      <div {...wrapperProps}>
        <IdentitySelection
          ownerType={ownerType}
          identities={identities}
          onChange={updateOwnerType}
        />

        <div style={{ marginTop: 5 }}>
          <BernoulliTrial onUpdate={mutate.in('args').updateValue} ratio={args as number} />

          {args === 1 ? (
            <button
              data-comp="set-to-true"
              className="set-to-true-button"
              onClick={() =>
                mutate.apply((m) =>
                  m
                    .up()
                    .in('Value')
                    .updateValue(true)
                    .up()
                    .in('Type')
                    .updateValue(ConditionValueType.SingleVariant)
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
                mutate.apply((m) =>
                  m
                    .up()
                    .in('Value')
                    .updateValue(false)
                    .up()
                    .in('Type')
                    .updateValue(ConditionValueType.SingleVariant)
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

export type RuleValueProps = {
  rule: Rule;
  mutate: AnyMutator<Rule, []>;
  valueType: ValueType;
  identities: string[];
};

const RuleValue = ({ rule, mutate, valueType, identities }: RuleValueProps) => {
  if (rule.Type === 'SingleVariant') {
    return (
      <SingleVariantValue
        mutate={mutate.in('Value')}
        value={rule.Value}
        identities={identities}
        valueType={valueType}
      />
    );
  }

  if (rule.Type === 'MultiVariant') {
    return (
      <MultiVariantValue
        mutate={mutate.in('ValueDistribution')}
        ValueDistribution={rule.ValueDistribution}
        ownerType={rule.OwnerType}
        identities={identities}
        valueType={valueType}
      />
    );
  }

  return null;
};

export default RuleValue;
