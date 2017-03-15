import React from 'react';
import RulesList from '../RulesList/RulesList';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import R from 'ramda';
import style from './PartitionsList.css';

const PartitionExpand = ({valueType, mutate}) => (
  <div className={style['partition-container']}>
    <RulesList valueType={valueType} mutate={mutate} />
  </div>
);

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

    let rulesData = extractPartitionToObject(mutate, partitions);

    rulesData = rulesData.map((x, i) => ({...x, valueType, id: i}));
    const hasDefaultValue = Object.keys(rulesByPartitions).includes("*");

    return (
      <div className={style['partitions-list-container']}>
        <button className={style['add-partition-button']} onClick={() => this.addPartition()}>Add partition</button>
        {!hasDefaultValue ?
          <button className={style['add-default-partition-button']} onClick={() => this.addDefaultPartition()}>
            Add default partition
          </button> : null
        }

        <BootstrapTable data={rulesData} tableStyle={{margin: '15px 0'}} expandComponent={PartitionExpand} expandableRow={() => true}>
          <TableHeaderColumn dataField='id' isKey={ true } hidden={true} />
          {
            partitions.map((partitionName) => (
              <TableHeaderColumn key={partitionName} dataField={partitionName}>{partitionName}</TableHeaderColumn>
            ))
          }
        </BootstrapTable>
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