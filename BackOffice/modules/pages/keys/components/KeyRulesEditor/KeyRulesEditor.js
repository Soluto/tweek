import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import JPadEditor from '../JPadEditor/JPadEditor';
import Mutator from '../../../../utils/mutator';
import wrapComponentWithClass from '../../../../utils/wrapComponentWithClass';
import { compose } from 'recompose';
import style from './KeyRulesEditor.css';

const MutatorFor = (propName) => (Comp) =>
  class extends React.Component {
    constructor() {
      super();
      this.state = {};
    }
    componentWillMount() {
      this.state.mutator = Mutator.stateless(() => this.props[propName], this.props.onMutation);
    }
    render() {
      return <Comp mutate={this.state.mutator} {...this.props} />;
    }
  };

const KeyRulesEditor = ({ ruleDef, mutate }) =>
  (
    <div className={style['key-rules-editor-container']}>
      <Tabs className={style['tab-container']}
        selectedIndex={0}
      >
        <TabList>
          <Tab className={style['tab-header']}>
            <label className={style['rule-definition-tab-icon']}>&#xE904; </label>
            <label className={style['tab-title']}>Rule</label>
          </Tab>
          <Tab className={style['tab-header']}>
            <label className={style['rule-source-tab-icon']}>&#xE901; </label>
            <label className={style['tab-title']}>Source</label>
          </Tab>
        </TabList>
        <TabPanel className={style['tab-content']}>
          <JPadEditor cases={mutate.target}
            mutate={mutate}
          />
        </TabPanel>
        <TabPanel className={style['tab-content']}>
          <pre className={style['rule-def-json']}>
            {JSON.stringify(JSON.parse(ruleDef.source), null, 4) }
          </pre>
        </TabPanel>
      </Tabs>
    </div>
  );

export default compose(MutatorFor('sourceTree'), wrapComponentWithClass)(KeyRulesEditor);
