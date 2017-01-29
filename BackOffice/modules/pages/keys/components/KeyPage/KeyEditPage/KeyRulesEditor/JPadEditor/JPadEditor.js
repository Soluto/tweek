import React from 'react';
import Rule from './Rule/Rule';
import style from './JPadEditor.css';
import Chance from 'chance';
import R from 'ramda';
import { withState, lifecycle, compose } from 'recompose';

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

const comp = ({ mutate, valueType, autofocusRuleIndex, setAutofocusRuleIndex }) => {
  const rulesMutator = mutate.in("Rules");
  const rules = rulesMutator.getValue();
  if (!rules) return (<div />);

  const hasDefaultValue = R.any(rule => Object.keys(rule.Matcher).length < 1)(rules);

  return !isBrowser ? (<div>Loading rule...</div>) :
    (<div className={style['rule-container']}>
      <button className={style['add-rule-button']} onClick={() => {
        addMutatorRule(rulesMutator);
        setAutofocusRuleIndex(0);
      } } >
        Add Rule
      </button>
      {!hasDefaultValue ?
        <button className={style['add-default-value-button']} onClick={() => {
          addMutatorDefaultValue(rulesMutator);
          setAutofocusRuleIndex(rulesMutator.getValue().length);
        } } >
          Add default rule
        </button> : null
      }

      {
        rules.map((rule, i) => (
          <div className={style['conditions-container']}
            disabled
            key={i}
            >

            <div className={style['rule-control-wrapper']} >
              {(i > 0 && i !== rules.length - 1) ?
                <button className={style['rule-order-button']}
                  onClick={() => rulesMutator.replaceKeys(i, i - 1)}
                  title="Move up">&#xE908;</button>
                : null}
              {(i < rules.length - 1 && i !== rules.length - 2) ?
                <button className={style['rule-order-button']}
                  onClick={() => rulesMutator.replaceKeys(i, i + 1)}
                  title="Move down">&#xE902;</button>
                : null}
              <button className={style['delete-rule-button']}
                onClick={() => {
                  deleteRule(rulesMutator, i);
                  setAutofocusRuleIndex(undefined);
                } }
                title="Remove rule"></button>
            </div>

            <Rule key={rule.Id}
              mutate={rulesMutator.in(i)}
              rule={rule}
              valueType={valueType}
              ruleIndex={i}
              autofocus={i === autofocusRuleIndex}
              />

          </div>
        ))
      }

    </div >
    );
};

export default compose(
  withState('autofocusRuleIndex', 'setAutofocusRuleIndex', undefined),
  lifecycle({
    componentDidUpdate() {
      if (this.props.autofocusRuleIndex !== undefined) this.props.setAutofocusRuleIndex(undefined);
    },
  }))(comp);
