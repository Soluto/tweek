import React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { updateKeyPartitions } from '../../../../../../store/ducks/selectedKey';
import ComboBox from '../../../../../../components/common/ComboBox/ComboBox';
import ReactTooltip from 'react-tooltip';
import style from './KeyPartitionSelector.css';
import alertIconSrc from '../resources/alert-icon.svg';
import * as ContextService from '../../../../../../services/context-service';

const getPartitionSuggestions = () => ContextService.getProperties().map(prop => ({ label: prop.name, value: prop.id }));

const KeyPartitionSelector = compose(
    connect(state => ({
        selectedKey: state.selectedKey,
        validation: state.selectedKey.validation.meta.partitions,
    }), { updateKeyPartitions })
)((props) => {
    const suggestions = getPartitionSuggestions();
    return (
        <div className={style['key-partitions-selector-container']}>
            <label className={style['key-partitions-label']}>Partition:</label>
            <div className={style['key-partitions-selector-wrapper']}
                 data-with-error={props.validation.isShowingHint}>
                <div className={style['validation-icon-wrapper']}
                     data-is-shown={props.validation.isShowingHint}>
                    <img data-tip={props.validation.hint}
                         className={style['validation-icon']}
                         src={alertIconSrc} />
                </div>
                <ComboBox
                    options={suggestions}
                    placeholder="Select type"
                    showValueInOptions={false}
                    onChange={item => props.updateKeyPartitions([item.value])}
                />
                <ReactTooltip
                    disable={!props.validation.isShowingHint}
                    effect="solid"
                    place="top"
                    delayHide={500} />
            </div>
        </div>
    );
});

export default KeyPartitionSelector;
