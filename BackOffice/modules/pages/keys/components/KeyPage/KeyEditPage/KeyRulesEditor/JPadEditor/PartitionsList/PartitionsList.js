import React from "react";
import RulesList from "../RulesList/RulesList";
import R from "ramda";
import style from "./PartitionsList.css";
import coreStyle from '../../../../../../../../styles/core/core.css'
import {Accordion, AccordionItem} from "react-sanfona";
import * as ContextService from '../../../../../../../../services/context-service';

const extractPartitionToObject = (mutate, partitions) => {
  if (partitions.length == 0)
    return [{mutate: mutate}];

  return R.flatten(
    Object.keys(mutate.getValue())
      .map(partitionValue => {
        const innerResults = extractPartitionToObject(mutate.in(partitionValue), partitions.slice(1));
        return innerResults.map(innerResult => ({
          [partitions[0]]: partitionValue,
          ...innerResult,
        }))
      })
  );
};

const NewProperty = ({value, setProperty, name, identity}) =>
  <div className={style['new-partition-item-container']}>
    <input className={style['value-input']}
           type="text"
           onChange={(e) => setProperty(e.target.value)}
           value={value || ''}
           placeholder={`${name} (${identity})`}
    />
  </div>;

class AddPartition extends React.Component {
  state = {};

  replaceState(state) {
    this.state = state;
    this.setState(state);
  }

  addPartition() {
    const {handlePartitionAddition} = this.props;
    if (handlePartitionAddition) handlePartitionAddition(this.state);
    this.replaceState({});
  }

  render() {
    const {partitions} = this.props;
    const allProperties = ContextService.getProperties();
    const indexedPartitions = partitions
      .map(partition => allProperties.find(property => property.id == partition) || {id: partition, name: partition});
    return (
      <div className={style['new-partition-container']}>
        {
          indexedPartitions.map(partition => <NewProperty key={partition.id}
                                                          {...partition}
                                                          value={this.state[partition.id]}
                                                          setProperty={value => this.setState({[partition.id]: value})}/>)
        }
        <button className={style['add-partition-button']} onClick={this.addPartition.bind(this)}/>
      </div>
    );
  }
}

export default class PartitionsList extends React.Component {
  state = {
    activeItems: []
  };

  render() {
    let {partitions, mutate, valueType} = this.props;

    const rulesByPartitions = mutate.getValue();
    if (!rulesByPartitions) return (<div />);

    let partitionsData = extractPartitionToObject(mutate, partitions);
    partitionsData = partitionsData.map((x, i) => ({
      ...x,
      valueType,
      id: i,
      partitionsValues: partitions.map(partitionName => x[partitionName])
    }));

    const hasDefaultValue = Object.keys(rulesByPartitions).includes("*");

    return (
      <div className={style['partitions-list-container']}>

        {!hasDefaultValue ?
          <button className={style['add-default-partition-button']} onClick={() => this.addPartition({})}>
            Add default partition
          </button> : null
        }

        <AddPartition partitions={partitions} handlePartitionAddition={this.addPartition.bind(this)}/>

        <Accordion className={style["partitions-accordion-container"]} allowMultiple={true}
                   activeItems={this.state.activeItems || []}
                   onChange={({activeItems}) => this.setState({activeItems})}>
          {
            partitionsData.map(partitionData => {

              const rules = partitionData.mutate.getValue();
              const isOnlyDefault = rules.length == 1 && Object.keys(rules[0].Matcher).length == 0 && rules[0].Type == 'SingleVariant';

              let partitionGroupName = partitionData.partitionsValues.map(x => x == "*" ? "Default" : x).join(', ');
              return (
                <AccordionItem
                  title={(
                    <div className={style["partitions-accordion-container-item-title"]}>
                      <h3>{partitionGroupName}</h3>
                      <div className={style["partitions-accordion-container-item-title-details"]}>
                        {
                          isOnlyDefault
                            ? 'value: ' + rules[0].Value
                            : 'rules: ' + rules.length
                        }
                      </div>
                      <div className={style["partitions-accordion-container-item-title-actions"]}>
                        <button className={coreStyle['gray-circle-button']} onClick={(e) => {
                          this.deletePartition(partitionData.partitionsValues);
                          e.stopPropagation();
                        }}>x</button>
                      </div>
                    </div>
                  )}
                  key={partitionGroupName}
                  className={style["partitions-accordion-container-item"]}
                  titleClassName={style["partitions-accordion-container-item-title"]}
                  expandedClassName={style["partitions-accordion-container-item-expanded"]}
                >
                  <RulesList valueType={valueType} mutate={partitionData.mutate}/>
                </AccordionItem>
              )
            })

          }
        </Accordion>
      </div >)
  }

  addPartition(newPartition) {
    let {mutate, partitions} = this.props;

    mutate.apply(m => {
      partitions.forEach((partition, i) => {
        const partitionValue = newPartition[partition] || '*';
        if (!m.getValue()[partitionValue]) {
          m.insert(partitionValue, i == partitions.length - 1 ? [] : {});
        }
        m = m.in(partitionValue);
      });

      return m;
    });
  }

  deletePartition(partitionGroup) {
    if (!confirm('Are you sure? \nThis will delete the partition along with all the rules inside it.')) return;

    let {mutate} = this.props;
    mutate.apply(partitionMutate => {
      for (let partition of partitionGroup) {
        partitionMutate = partitionMutate.in(partition);
      }

      let i = partitionGroup.length;
      do {
        i--;
        partitionMutate.delete();
        partitionMutate = partitionMutate.up();
      } while (i && Object.keys(partitionMutate.getValue()).length == 0);

      return partitionMutate;
    });
  }
}
