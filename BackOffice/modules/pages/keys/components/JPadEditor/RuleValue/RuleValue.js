import React from 'react';
import CustomSlider from '../../../../../components/common/CustomSlider';
import TextareaAutosize from 'react-autosize-textarea';
import style from './RuleValue.css';

function replaceNaN(fallbackValue) { return isNaN(this) ? fallbackValue : this; }
const parseNumericInput = (inputValue) => inputValue === '' ? 0 : parseInt(inputValue);

let SingleVariantValue = ({ value, mutate }) => (
  (<div className={style['rule-value-container']}>

    <TextareaAutosize
      onChange={e => mutate.updateValue(e.target.value) }
      value = { value }
      placeholder="Enter values here"
      className={style['values-input']}
      />

    {(value === 'true' || value === 'false') ?
      <button onClick={() => mutate.apply(m =>
        m.delete()
          .in('Type').updateValue('MultiVariant').up()
          .insert('ValueDistribution', {
            type: 'bernoulliTrial',
            args: 0.1,
          })
      ) }>To Feature Flag</button>
      :
      <button className={style['add-variant-button']}
        onClick={() => mutate.apply(m =>
          m.delete()
            .in('Type').updateValue('MultiVariant').up()
            .insert('ValueDistribution', {
              type: 'weighted',
              args: {
                [value]: 50,
                'New Varaint': 50,
              },
            })
        ) }
        >Add Variant</button>}
  </div>)
);

const WeightedValues = ({ onUpdate, variants }) =>
  (<CustomSlider data={variants} onUpdate={onUpdate} />);

const BernoulliTrial = ({ onUpdate, ratio }) => (
  <div>
    <div>Open to <input type="text" style={{ width: 40 }} value={ratio * 100} onChange={e =>
      onUpdate((parseNumericInput(e.target.value) * 0.01):: replaceNaN(ratio))
      } />%</div>
    <CustomSlider displayLegend={false}
      data={{ true: 1000 * ratio / 10, false: 100 - (1000 * ratio / 10) }}
      onUpdate={x => onUpdate(x.true / 100) }
      />
  </div>
);

const MultiVariantValue = ({ valueDistrubtion: { type, args }, mutate }) => {
  if (type === 'weighted')
    return (<WeightedValues variants={args} onUpdate={variants => {
      if (Object.keys(variants).length === 1) {
        const newValue = Object.keys(variants)[0];
        mutate.apply(m => m.up()
          .in('Value').updateValue(newValue).up()
          .in('Type').updateValue('SingleVariant').up()
          .in('ValueDistribution').delete());
      } else {
        mutate.in('args').updateValue(variants);
      }
    } } />);
  if (type === 'bernoulliTrial') {
    return (<div>
      <BernoulliTrial onUpdate={mutate.in('args').updateValue} ratio={args} />
      {(args === 1) ?
        <button onClick={() => mutate.apply(m =>
          m.up()
            .in('Value').updateValue('true').up()
            .in('Type').updateValue('SingleVariant').up()
            .in('ValueDistribution').delete()
        ) }>Set to true</button> : null}
      {(args === 0) ?
        <button onClick={() => mutate.apply(m =>
          m.up()
            .in('Value').updateValue('false').up()
            .in('Type').updateValue('SingleVariant').up()
            .in('ValueDistribution').delete()
        ) }>Set to false</button> : null}
    </div>
    );
  }
  return null;
};

export default ({ rule, mutate }) => {
  if (rule.Type === 'SingleVariant')
    return (<SingleVariantValue mutate={mutate.in('Value') } value={rule.Value} />);
  if (rule.Type === 'MultiVariant')
    return (<MultiVariantValue mutate={mutate.in('ValueDistribution') } valueDistrubtion={rule.ValueDistribution} />);
  return null;
};
