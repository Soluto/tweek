import { attributeSelector, dataComp } from '../../utils/selector-utils';
import { Selector } from 'testcafe';
import ObjectEditor from './ObjectEditor';
import NewRule from './Rules/NewRule';
import Rule from './Rules/Rule';
import TypedInput from './TypedInput';

const tabHeader = attributeSelector('data-tab-header');

export default class JPad {
  container = Selector(dataComp('key-rules-editor'));

  defaultValue = new TypedInput(this.container.find(dataComp('default-value')));

  sourceTab = this.container.find(tabHeader('source'));
  rulesTab = this.container.find(tabHeader('rules'));

  sourceEditor = new ObjectEditor();
  newRule = new NewRule();

  rule(i = 0) {
    return new Rule(i);
  }

  rulesCount = Rule.ruleContainer.count;
}
