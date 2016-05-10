import React from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import JPadEditor from './JPadEditor/JPadEditor'
import Mutator from '../../../utils/mutator'

export default ({ ruleDef, updateRule })=>(
    <div>
    <Tabs selectedIndex={0}>
        <TabList>
            <Tab>Rule</Tab>
            <Tab>Source</Tab>
        </TabList>
         <TabPanel>
          <JPadEditor source={ruleDef.source} 
          mutate={new Mutator(JSON.parse(ruleDef.source),
                 (sourceTree)=>updateRule({ ...ruleDef, source: JSON.stringify(sourceTree) }) )} />
        </TabPanel>
        <TabPanel>
          <pre>
            {JSON.stringify(JSON.parse(ruleDef.source), null, 4)}
            </pre>
        </TabPanel>
    </Tabs>
    </div>
)
