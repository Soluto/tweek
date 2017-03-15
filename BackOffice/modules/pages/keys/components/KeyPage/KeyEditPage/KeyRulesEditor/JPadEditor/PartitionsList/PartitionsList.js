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
  render () {
    let {partitions, mutate, valueType} = this.props;

    const rulesByPartitions = mutate.getValue();
    if (!rulesByPartitions) return (<div />);

    let partitionsData = extractPartitionToObject(mutate, partitions);

    partitionsData = partitionsData.map((x, i) => ({...x, valueType, id: i}));
    const hasDefaultValue = Object.keys(rulesByPartitions).includes("*");

    return (
      <div className={style['partitions-list-container']}>
        <button className={style['add-partition-button']} onClick={() => this.addPartition()}>Add partition</button>
        {!hasDefaultValue ?
          <button className={style['add-default-partition-button']} onClick={() => this.addDefaultPartition()}>
            Add default partition
          </button> : null
        }

        <Accordion className={style["partitions-accordion-container"]} allowMultiple={true}>
          {
            partitionsData.map(partitionData => {

              let partitionGroupName = partitions.map(partitionName => partitionData[partitionName]).join(', ');
              return (
                <AccordionItem
                  title={partitionGroupName}
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

  deletePartition(partitionKey) {
    let {mutate} = this.props;

    if (confirm('Are you sure?')) {
      mutate.in(partitionKey).delete();
    }
  }
}