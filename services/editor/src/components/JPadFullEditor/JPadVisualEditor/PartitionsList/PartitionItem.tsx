import classnames from 'classnames';
import React, { useState } from 'react';
import { Collapse } from 'react-collapse';
import { ValueType } from 'tweek-client';
import { AnyMutator } from '../../../../utils/mutator';
import { Rule, SingleValueRule } from '../../types';
import RulesList from '../RulesList/RulesList';

export type PartitionItemProps = {
  valueType: ValueType;
  onDelete: () => void;
  partitionsValues: string[];
  mutate: AnyMutator<Rule[]>;
};

const PartitionItem = ({ valueType, partitionsValues, mutate, onDelete }: PartitionItemProps) => {
  const [open, setOpen] = useState(false);

  const rules = mutate.getValue();

  const isOnlyDefault =
    rules.length === 1 &&
    Object.keys(rules[0].Matcher).length === 0 &&
    rules[0].Type === 'SingleVariant';

  const partitionGroupName = partitionsValues.map((x) => (x === '*' ? 'Default' : x)).join(', ');

  return (
    <div
      className={classnames(
        'partitions-accordion-container-item',
        open && 'partitions-accordion-container-item-expanded',
      )}
    >
      <div
        className="partitions-accordion-container-item-title"
        data-comp="partition-group"
        data-group={partitionGroupName.toLowerCase()}
        onClick={() => setOpen((x) => !x)}
      >
        <div className="expander-icon"></div>
        <h3>{partitionGroupName}</h3>
        <div className="partitions-accordion-container-item-title-details">
          {isOnlyDefault
            ? `value: ${
                valueType.name === 'object'
                  ? JSON.stringify((rules[0] as SingleValueRule).Value)
                  : (rules[0] as SingleValueRule).Value
              }`
            : `rules: ${rules.length}`}
        </div>
        <div className="partitions-accordion-container-item-title-actions">
          <button
            data-comp="delete-partition-group"
            className="gray-circle-button"
            onClick={(e) => {
              onDelete();
              e.stopPropagation();
            }}
          >
            x
          </button>
        </div>
      </div>
      <Collapse isOpened={open}>
        <RulesList valueType={valueType} mutate={mutate} />
      </Collapse>
    </div>
  );
};

export default PartitionItem;
