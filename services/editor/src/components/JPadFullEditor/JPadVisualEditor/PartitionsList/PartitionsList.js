import * as R from 'ramda';
import React, { useState } from 'react';
import { Accordion, AccordionItem } from 'react-sanfona';
import '../../../../styles/core/core.css';
import RulesList from '../RulesList/RulesList';
import NewPartition from './NewPartition';
import './PartitionsList.css';

const extractPartitionToObject = (mutate, partitions) => {
  if (partitions.length === 0) {
    return [{ mutate }];
  }

  return R.flatten(
    Object.keys(mutate.getValue()).map((partitionValue) => {
      const innerResults = extractPartitionToObject(mutate.in(partitionValue), partitions.slice(1));
      return innerResults.map((innerResult) => ({
        [partitions[0]]: partitionValue,
        ...innerResult,
      }));
    }),
  );
};

const sortPartitions = (partitions) =>
  R.sortWith(partitions.map((_, i) => R.descend(R.pipe(R.prop('partitionsValues'), R.prop(i)))));

const deletePartitionGroupAlert = {
  title: 'Are you sure?',
  message:
    'This operation will delete the partition group along with all the rules inside it.\nDo you want to continue?',
};

const PartitionsList = ({ partitions, mutate, valueType, alerter, keyPath }) => {
  const [activeItems, setActiveItems] = useState([]);

  const rulesByPartitions = mutate.getValue();
  if (!rulesByPartitions) {
    return <div />;
  }

  const addPartition = ({ partition: newPartition, defaultValue }) => {
    console.log({ newPartition, defaultValue });

    const partitionDefaultValue =
      defaultValue === '' ? [] : [{ Type: 'SingleVariant', Matcher: {}, Value: defaultValue }];
    mutate.apply((m) => {
      partitions.forEach((partition, i) => {
        const partitionValue = newPartition[partition] || '*';
        if (!m.getValue()[partitionValue]) {
          m.insert(partitionValue, i === partitions.length - 1 ? partitionDefaultValue : {});
        }
        m = m.in(partitionValue);
      });

      return m;
    });
  };

  const deletePartition = async (partitionGroup) => {
    if ((await alerter.showConfirm(deletePartitionGroupAlert)).result) {
      mutate.apply((partitionMutate) => {
        for (const partition of partitionGroup) {
          partitionMutate = partitionMutate.in(partition);
        }

        let i = partitionGroup.length;
        do {
          partitionMutate.delete();
          partitionMutate = partitionMutate.up();
        } while (--i && Object.keys(partitionMutate.getValue()).length === 0);

        return partitionMutate;
      });
    }
  };

  let partitionsData = extractPartitionToObject(mutate, partitions);

  partitionsData = partitionsData.map((x, i) => ({
    ...x,
    valueType,
    id: i,
    partitionsValues: partitions.map((partitionName) => x[partitionName]),
  }));

  partitionsData = sortPartitions(partitions)(partitionsData);

  const hasDefaultValue = Object.keys(rulesByPartitions).includes('*');

  return (
    <div className="partitions-list-container">
      {!hasDefaultValue && (
        <button className="add-default-partition-button" onClick={() => addPartition({})}>
          Add default partition
        </button>
      )}

      <NewPartition
        partitions={partitions}
        handlePartitionAddition={addPartition}
        valueType={valueType}
      />

      <Accordion
        className="partitions-accordion-container"
        allowMultiple
        activeItems={activeItems}
        onChange={({ activeItems }) => setActiveItems(activeItems)}
      >
        {partitionsData.map((partitionData) => {
          const rules = partitionData.mutate.getValue();
          const isOnlyDefault =
            rules.length === 1 &&
            Object.keys(rules[0].Matcher).length === 0 &&
            rules[0].Type === 'SingleVariant';

          const partitionGroupName = partitionData.partitionsValues
            .map((x) => (x === '*' ? 'Default' : x))
            .join(', ');
          return (
            <AccordionItem
              title={
                <div
                  className="partitions-accordion-container-item-title"
                  data-comp="partition-group"
                  data-group={partitionGroupName.toLowerCase()}
                >
                  <div className="expander-icon"></div>
                  <h3>{partitionGroupName}</h3>
                  <div className="partitions-accordion-container-item-title-details">
                    {isOnlyDefault
                      ? `value: ${
                          valueType.name === 'object'
                            ? JSON.stringify(rules[0].Value)
                            : rules[0].Value
                        }`
                      : `rules: ${rules.length}`}
                  </div>
                  <div className="partitions-accordion-container-item-title-actions">
                    <button
                      data-comp="delete-partition-group"
                      className="gray-circle-button"
                      onClick={(e) => {
                        deletePartition(partitionData.partitionsValues);
                        e.stopPropagation();
                      }}
                    >
                      x
                    </button>
                  </div>
                </div>
              }
              key={partitionGroupName}
              className="partitions-accordion-container-item"
              titleClassName="partitions-accordion-container-item-title"
              expandedClassName="partitions-accordion-container-item-expanded"
            >
              <RulesList {...{ valueType, alerter, keyPath }} mutate={partitionData.mutate} />
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export default PartitionsList;
