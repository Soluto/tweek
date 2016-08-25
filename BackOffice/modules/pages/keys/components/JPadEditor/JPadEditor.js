import React from 'react';
import Rule from './Rule/Rule';
import style from './JPadEditor.css';
import Chance from 'chance';
import R from 'ramda';

const isBrowser = typeof (window) === 'object';
const chance = new Chance();

function deleteRule(mutate, ruleIndex) {
  if (confirm('Are you sure?')) {
    mutate.in(ruleIndex).delete();
  }
}

function addMutatorDefaultValue(mutate) {
  mutate.append({ Id: chance.guid(), Matcher: {}, Value: '', Type: 'SingleVariant' });
}

function addMutatorRule(mutate) {
  mutate.prepend({ Id: chance.guid(), Matcher: { '': '' }, Value: '', Type: 'SingleVariant' });
}

export default ({ rules, mutate }) => {
  if (!rules) return (<div/>);

  const hasDefaultValue = R.any(rule => Object.keys(rule.Matcher).length < 1)(rules);

  return isBrowser ? (
    <div className={style['rule-container']}>

      <button className={style['add-rule-button']} onClick={() => addMutatorRule(mutate) } >
        Add Rule
      </button>
      { !hasDefaultValue ?
        <button className={style['add-default-value-button']} onClick={() => addMutatorDefaultValue(mutate) } >
          Add default rule
        </button> : null }

      {rules.map((rule, i) => (
        <div className={style['conditions-container']}
          disabled
          key={i}
          >

          <div className={style['rule-control-wrapper']} >
            {i > 0 ?
              <button className={style['rule-order-button']}
                onClick={() => mutate.replaceKeys(i, i - 1) }
                title="Move up"
                >
                &#xE908;
              </button>
              : null }
            {i < rules.length - 1 ?
              <button className={style['rule-order-button']}
                onClick={() => mutate.replaceKeys(i, i + 1) }
                title="Move down"
                >
                &#xE902;
              </button>
              : null }
            <button className={style['delete-rule-button']}
              onClick={() => deleteRule(mutate, i) }
              title="Remove rule"
              ></button>
          </div>

          <Rule key={rule.Id} mutate={mutate.in(i) } rule={rule} />

        </div>
      ))
      }

    </div >
  )
    :
    (<div>Loading rule...</div>);
};
