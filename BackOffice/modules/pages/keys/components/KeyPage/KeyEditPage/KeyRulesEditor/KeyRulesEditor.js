import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import JPadEditor from './JPadEditor/JPadEditor';
import Mutator from '../../../../../../utils/mutator';
import wrapComponentWithClass from '../../../../../../hoc/wrap-component-with-class';
import { compose, pure, lifecycle } from 'recompose';
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
      const {[propName]: _, ...otherProps } = this.props;
      return <Comp mutate={this.state.mutator} {...otherProps} />;
    }
  };

const KeyRulesEditor = ({ keyDef, mutate, schema }) => {

  return (
    <div className={style['key-rules-editor-container']}>
      <Tabs className={style['tab-container']}>
        <TabList>
          <Tab className={style['tab-header']}>
            <label className={style['key-definition-tab-icon']}>&#xE904; </label>
            <label className={style['tab-title']}>Rules</label>
          </Tab>
          <Tab className={style['tab-header']}>
            <label className={style['key-source-tab-icon']}>&#xE901; </label>
            <label className={style['tab-title']}>Source</label>
          </Tab>
        </TabList>
        <TabPanel className={style['tab-content']}>
          <JPadEditor
            jpadSource={keyDef.source}
            mutate={mutate}
            schema={schema}
            valueType={keyDef.valueType}
            />
        </TabPanel>
        <TabPanel className={style['tab-content']}>
          <pre className={style['key-def-json']}>
            {JSON.stringify(JSON.parse(keyDef.source), null, 4)}
          </pre>
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default compose(
  MutatorFor('sourceTree'),
  wrapComponentWithClass,
  pure,
  lifecycle({
    componentWillReceiveProps({keyDef, mutate}) {
      if (keyDef.valueType === mutate.in('valueType').getValue()) return;
      mutate.in('valueType').updateValue(keyDef.valueType);
    }
  }))(KeyRulesEditor);
