import React from 'react';
import RulesList from '../RulesList/RulesList';

export default class PartitionsList extends React.Component {
  render () {
    let {mutate, valueType} = this.props;

    const partitions = mutate.getValue();
    if (!partitions) return (<div />);

    const partitionKeys = Object.keys(partitions);
    const hasDefaultValue = partitionKeys.includes("*");

    return (
      <div>
      <button onClick={() => this.addPartition()}>Add partition</button>
      {!hasDefaultValue ?
        <button onClick={() => this.addDefaultPartition()}>
          Add default partition
        </button> : null
      }

      {partitionKeys.filter(key => key != "*").map((partitionKey) => (
          <div key={partitionKey}>
            <h3>{partitionKey}</h3>
            <button onClick={() => this.deletePartition(partitionKey)}>Delete</button>

            <RulesList valueType={valueType} mutate={mutate.in(partitionKey)} />
          </div>
        ))}

        {!hasDefaultValue ? null : (
            <div key={"default-partition"}>
              <h3>Default</h3>
              <button onClick={() => this.deletePartition("*")}>Delete</button>

              <RulesList valueType={valueType} mutate={mutate.in("*")} />
            </div>
          )}
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