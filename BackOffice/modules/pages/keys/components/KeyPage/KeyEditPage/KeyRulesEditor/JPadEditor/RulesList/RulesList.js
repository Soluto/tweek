import React from 'react';
import Rule from '../Rule/Rule';
import style from './RulesList.css';
import Chance from 'chance';

const chance = new Chance();

export default class RulesList extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      autofocusRuleIndex: undefined
    }
  }

  componentDidUpdate() {
    if (this.state.autofocusRuleIndex !== undefined) this.setState({autofocusRuleIndex: undefined})
  }

  render () {
    let {mutate, valueType} = this.props;
    let {autofocusRuleIndex} = this.state;

    const rules = mutate.getValue();
    if (!rules) return (<div />);

    return <div className={style['rule-container']}>
      <button className={style['add-rule-button']} onClick={() => {
        this.addMutatorRule();
        this.setState({autofocusRuleIndex: 0});
      } } >
        Add Rule
      </button>

      {
        rules.map((rule, i) => (
          <div className={style['conditions-container']}
               disabled
               key={i}
          >

            <div className={style['rule-control-wrapper']} >
              {(i > 0) ?
                <button className={style['rule-order-button']}
                        onClick={() => mutate.replaceKeys(i, i - 1)}
                        title="Move up">&#xE908;</button>
                : null}
              {(i < rules.length - 1) ?
                <button className={style['rule-order-button']}
                        onClick={() => mutate.replaceKeys(i, i + 1)}
                        title="Move down">&#xE902;</button>
                : null}
              <button className={style['delete-rule-button']}
                      onClick={() => {
                        this.deleteRule(i);
                        this.setState({autofocusRuleIndex: undefined});
                      } }
                      title="Remove rule"/>
            </div>

            <Rule
              key={rule.Id}
              mutate={mutate.in(i)}
              rule={rule}
              valueType={valueType}
              ruleIndex={i}
              autofocus={i === autofocusRuleIndex}
            />

          </div>
        ))
      }

    </div >
  }

  addMutatorRule() {
    let {mutate} = this.props;

    mutate.prepend({ Id: chance.guid(), Matcher: { '': '' }, Value: '', Type: 'SingleVariant' });
  }

  addMutatorDefaultValue() {
    let {mutate} = this.props;

    mutate.append({ Id: chance.guid(), Matcher: {}, Value: '', Type: 'SingleVariant' });
  }

  async deleteRule(ruleIndex) {
    const {mutate, showConfirm} = this.props;

    if ((await showConfirm({
        title: 'Warning',
        message: 'Are you sure you want to delete this rule?',
      })).result) {
      mutate.in(ruleIndex).delete();
    }
  }
}
