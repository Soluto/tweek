import React from 'react';
import Chance from 'chance';
import Rule from '../Rule/Rule';
import './RulesList.css';

const chance = new Chance();

const deleteRuleAlert = {
  title: 'Warning',
  message: 'Are you sure you want to delete this rule?',
};

export default class RulesList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      autofocusRuleIndex: undefined,
    };
  }

  componentDidUpdate() {
    if (this.state.autofocusRuleIndex !== undefined) {
      this.setState({ autofocusRuleIndex: undefined });
    }
  }

  render() {
    let { mutate, valueType } = this.props;
    let { autofocusRuleIndex } = this.state;

    const rules = mutate.getValue();
    if (!rules) return <div />;

    return (
      <div className={'rule-item-container'}>
        <button
          className={'add-rule-button'}
          onClick={() => {
            this.addMutatorRule();
            this.setState({ autofocusRuleIndex: 0 });
          }}
        >
          Add Rule
        </button>

        {rules.map((rule, i) =>
          <div className={'conditions-container'} disabled key={i}>

            <div className={'rule-control-wrapper'}>
              {i > 0
                ? <button
                    className={'rule-order-button'}
                    onClick={() => mutate.replaceKeys(i, i - 1)}
                    title="Move up"
                  >
                    
                  </button>
                : null}
              {i < rules.length - 1
                ? <button
                    className={'rule-order-button'}
                    onClick={() => mutate.replaceKeys(i, i + 1)}
                    title="Move down"
                  >
                    
                  </button>
                : null}
              <button
                className={'delete-rule-button'}
                onClick={() => {
                  this.deleteRule(i);
                  this.setState({ autofocusRuleIndex: undefined });
                }}
                title="Remove rule"
              />
            </div>

            <Rule
              key={rule.Id}
              mutate={mutate.in(i)}
              rule={rule}
              valueType={valueType}
              ruleIndex={i}
              autofocus={i === autofocusRuleIndex}
            />

          </div>,
        )}

      </div>
    );
  }

  addMutatorRule() {
    let { mutate } = this.props;

    mutate.prepend({ Id: chance.guid(), Matcher: { '': '' }, Value: '', Type: 'SingleVariant' });
  }

  addMutatorDefaultValue() {
    let { mutate } = this.props;

    mutate.append({ Id: chance.guid(), Matcher: {}, Value: '', Type: 'SingleVariant' });
  }

  async deleteRule(ruleIndex) {
    const { mutate, alerter } = this.props;

    if ((await alerter.showConfirm(deleteRuleAlert)).result) {
      mutate.in(ruleIndex).delete();
    }
  }
}
