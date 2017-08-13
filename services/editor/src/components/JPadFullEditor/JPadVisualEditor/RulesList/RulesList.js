import React from 'react';
import Rule from '../Rule/Rule';
import './RulesList.css';

const deleteRuleAlert = {
  title: 'Warning',
  message: 'Are you sure you want to delete this rule?',
};

export default class RulesList extends React.Component {
  state = {};

  componentDidUpdate() {
    if (this.state.autofocusRuleIndex !== undefined) {
      this.setState({ autofocusRuleIndex: undefined });
    }
  }

  render() {
    let { mutate, valueType, keyPath } = this.props;
    let { autofocusRuleIndex } = this.state;

    const rules = mutate.getValue();
    if (!rules) return <div />;

    return (
      <div className="rule-item-container" data-comp="rules-list">
        <button
          className="add-rule-button"
          data-comp="add-rule"
          onClick={() => {
            this.addMutatorRule();
            this.setState({ autofocusRuleIndex: 0 });
          }}
        >
          Add Rule
        </button>

        {rules.map((rule, i) =>
          <div className="conditions-container" data-comp="rule" key={rules.length - i}>

            <div className="rule-control-wrapper">
              {i > 0
                ? <button
                    className="rule-order-button"
                    onClick={() => mutate.replaceKeys(i, i - 1)}
                    title="Move up"
                  >
                    
                  </button>
                : null}
              {i < rules.length - 1
                ? <button
                    className="rule-order-button"
                    onClick={() => mutate.replaceKeys(i, i + 1)}
                    title="Move down"
                  >
                    
                  </button>
                : null}
              <button
                className="delete-rule-button"
                data-comp="delete-rule"
                onClick={() => {
                  this.deleteRule(i);
                  this.setState({ autofocusRuleIndex: undefined });
                }}
                title="Remove rule"
              />
            </div>

            <Rule
              key={rule.Id}
              keyPath={keyPath}
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

    mutate.prepend({ Matcher: { '': '' }, Value: '', Type: 'SingleVariant' });
  }

  async deleteRule(ruleIndex) {
    const { mutate, alerter } = this.props;

    if ((await alerter.showConfirm(deleteRuleAlert)).result) {
      mutate.in(ruleIndex).delete();
    }
  }
}
