import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import JPadEditor from '../JPadEditor/JPadEditor';
import Mutator from '../../../../utils/mutator';
import wrapComponentWithClass from '../../../../utils/wrapComponentWithClass';
import { compose } from 'recompose';

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
    <div>
      <Tabs selectedIndex={0}>
        <TabList>
          <Tab>Rule</Tab>
          <Tab>Source</Tab>
        </TabList>
        <TabPanel>
          <JPadEditor cases={mutate.target}
            mutate={mutate}
          />
        </TabPanel>
        <TabPanel>
          <pre>
            {JSON.stringify(JSON.parse(ruleDef.source), null, 4) }
          </pre>
        </TabPanel>
      </Tabs>
    </div>
  );

export default compose(MutatorFor('sourceTree'), wrapComponentWithClass)(KeyRulesEditor);
