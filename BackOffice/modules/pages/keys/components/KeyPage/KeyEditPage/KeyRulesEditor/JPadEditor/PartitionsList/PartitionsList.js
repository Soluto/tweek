import React from "react";
import RulesList from "../RulesList/RulesList";
import R from "ramda";
import style from "./PartitionsList.css";
import {Accordion, AccordionItem} from "react-sanfona";

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

export default class PartitionsList extends React.Component {

  state = {
    activeItems: []
  };

  render () {
    let {partitions, mutate, valueType} = this.props;

    const rulesByPartitions = mutate.getValue();
    if (!rulesByPartitions) return (<div />);

    let partitionsData = extractPartitionToObject(mutate, partitions);

    partitionsData = partitionsData.map((x, i) => ({...x, valueType, id: i, partitionsValues: partitions.map(partitionName => x[partitionName])}));
    const hasDefaultValue = Object.keys(rulesByPartitions).includes("*");

    return (
      <div className={style['partitions-list-container']}>
        <button className={style['add-partition-button']} onClick={() => this.addPartition()}>Add partition</button>
        {!hasDefaultValue ?
          <button className={style['add-default-partition-button']} onClick={() => this.addDefaultPartition()}>
            Add default partition
          </button> : null
        }

        <Accordion className={style["partitions-accordion-container"]} allowMultiple={true} activeItems={this.state.activeItems || []} onChange={({activeItems}) => this.setState({activeItems})}>
          {
            partitionsData.map(partitionData => {

              const rules = partitionData.mutate.getValue();
              const isOnlyDefault = rules.length === 1 && Object.keys(rules[0].Matcher).length === 0;

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
                        <button className={style['add-partition-button']} onClick={() => this.deletePartition(partitionData.partitionsValues)}>delete</button>
                      </div>
                    </div>
                  )}
                  key={partitionGroupName}
                  className={style["partitions-accordion-container-item"]}
                  titleClassName={style["partitions-accordion-container-item-title"]}
                  expandedClassName={style["partitions-accordion-container-item-expanded"]}
                >
                  <RulesList valueType={valueType} mutate={partitionData.mutate} />
                </AccordionItem>
              )
            })
          }
        </Accordion>
      </div >)
  }

  addPartition() {
    let {mutate} = this.props;
    mutate.insert("Verizon", []);
  }

  addDefaultPartition() {
    let {mutate} = this.props;
    mutate.insert("*", []);
  }

  deletePartition(partitionGroup) {
    let {mutate} = this.props;

    if (confirm('Are you sure?')) {
      let partitionMutate = mutate;

      for (let partition of partitionGroup){
        partitionMutate = partitionMutate.in(partition);
      }

      partitionMutate.delete();

      for (let i = 0; i < partitionGroup.length - 1; i++){
        partitionMutate.up();

        if (Object.keys(partitionMutate.getValue()).length == 0){
          partitionMutate.delete();
        }
        else {
          break;
        }
      }
    }
  }
}