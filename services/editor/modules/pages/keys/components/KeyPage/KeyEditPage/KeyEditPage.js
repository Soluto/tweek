import React, { Component } from 'react';
import { compose, pure } from 'recompose';
import { connect } from 'react-redux';
import R from 'ramda';
import classNames from 'classnames';
import ReactTooltip from 'react-tooltip';
import JPadFullEditor from '../../../../../components/JPadFullEditor/JPadFullEditor';
import style from './KeyEditPage.css';
import KeyTags from './KeyTags/KeyTags';
import EditableText from './EditableText/EditableText';
import EditableTextArea from './EditableTextArea/EditableTextArea';
import RevisionHistory from './RevisionHistory';
import KeyPageActions from './KeyPageActions/KeyPageActions';
import ComboBox from '../../../../../components/common/ComboBox/ComboBox';
import alertIconSrc from './resources/alert-icon.svg';
import stickyHeaderIdentifier from '../../../../../hoc/sticky-header-identifier';
import KeyValueTypeSelector from './KeyValueTypeSelector/KeyValueTypeSelector';

class KeyEditPage extends Component {
  constructor(props) {
    super(props);
    // this.onMutation = this.onMutation.bind(this);
    this.onKeyNameChanged = this.onKeyNameChanged.bind(this);
    this.onDisplayNameChanged = this.onDisplayNameChanged.bind(this);
  }

  onTagsChanged(newTags) {
    const oldMeta = this.props.selectedKey.local.meta;
    const newMeta = {
      ...oldMeta,
      meta: {
        ...oldMeta.meta,
        tags: newTags,
      },
    };
    this.onSelectedKeyMetaChanged(newMeta);
  }

  onKeyNameChanged(newKeyName) {
    this.props.updateKeyName(newKeyName);
  }

  onDisplayNameChanged(newDisplayName) {
    const oldMeta = this.props.selectedKey.local.meta;
    const newMeta = {
      ...oldMeta,
      meta: {
        ...oldMeta.meta,
        name: newDisplayName,
      },
    };
    this.onSelectedKeyMetaChanged(newMeta);
  }

  onDescriptionChanged(newDescription) {
    const oldMeta = this.props.selectedKey.local.meta;
    const newMeta = {
      ...oldMeta,
      meta: {
        ...oldMeta.meta,
        description: newDescription,
      },
    };
    this.onSelectedKeyMetaChanged(newMeta);
  }

  onSelectedKeyMetaChanged(newMeta) {
    this.props.updateKeyMetaDef(newMeta);
  }

  onDependencyChanges(dependencies) {
    const oldMeta = this.props.selectedKey.local.meta;
    const newMeta = {
      ...oldMeta,
      dependencies,
    };
    this.onSelectedKeyMetaChanged(newMeta);
  }

  render() {
    const { selectedKey, isInAddMode, isInStickyMode, alerter, revision } = this.props;
    const { key, local: { meta, keyDef, revisionHistory } } = selectedKey;
    const isHistoricRevision = (revision && revisionHistory[0].sha !== revision);
    const isReadonly = (!!meta.meta.readOnly && meta.meta.readOnly) || isHistoricRevision;

    const commonHeadersProps = {
      onKeyNameChanged: this.onKeyNameChanged,
      onDisplayNameChanged: this.onDisplayNameChanged,
      isInAddMode,
      isHistoricRevision,
      isReadonly,
      keyMeta: meta,
    };

    return (
      <div id="key-viewer-container-form" className={style['key-viewer-container-form']}>
        <div className={style['key-viewer-container-fieldset']}>

          <div className={style['key-viewer-container']}>
            {isInStickyMode ?
              <KeyStickyHeader {...commonHeadersProps} />
              : null}
            <KeyFullHeader
              {...commonHeadersProps}
              onDescriptionChanged={text => this.onDescriptionChanged(text)}
              onTagsChanged={newTags => this.onTagsChanged(newTags)}
              revisionHistory={revisionHistory}
              revision={revision}
              keyFullPath={key}
              isInStickyMode={isInStickyMode}
            />

            <JPadFullEditor
              {...{ keyDef, alerter }}
              source={keyDef.source}
              onChange={source => this.props.updateKeyDef({ source })}
              dependencies={meta.dependencies}
              onDependencyChanges={deps => this.onDependencyChanges(deps)}
              isReadonly={isReadonly}
              className={classNames(style['key-rules-editor'], { [style.sticky]: isInStickyMode })}
            />

          </div>

        </div>
      </div>
    );
  }
}

export default compose(
  stickyHeaderIdentifier('key-viewer-container-form', 150),
  pure,
)(KeyEditPage);

const KeyStickyHeader = (props) => {
  const { isInAddMode, isReadonly, isHistoricRevision } = props;

  return (
    <div className={style['sticky-key-header']} disabled={isReadonly}>

      <HeaderMainInput {...props} />

      {!isReadonly ?
        <div className={style['sticky-key-page-action-wrapper']}>
          <KeyPageActions {...{ isInAddMode, isReadonly, isHistoricRevision }} isInStickyMode />
        </div> :
        null}
    </div>
  );
};

const KeyFullHeader = (props) => {
  const {
    isInAddMode,
    isReadonly,
    revisionHistory,
    keyMeta,
    onDescriptionChanged,
    onTagsChanged,
    keyFullPath,
    revision,
    isHistoricRevision,
  } = props;

  return (
    <div className={style['key-header']}>

      <KeyPageActions {...{ isInAddMode, isReadonly, isHistoricRevision }} isInStickyMode={false} />

      <div className={style['key-meta-container']}>

        <div className={style['key-header-and-modification-wrapper']}>

          <HeaderMainInput {...props} />
          {revisionHistory ?
            <RevisionHistory revision={revision} revisionHistory={revisionHistory} />
            : null
          }

        </div>

        <fieldset disabled={isReadonly} style={{ border: 'none' }}>

          {!isInAddMode ? <div className={style['key-full-path']}>
            <label>Full path: </label>
            <label className={style['actual-path']}>{keyFullPath}</label>
          </div> : null}

          <div className={style['key-description-and-tags-wrapper']}>
            <div className={style['key-description-wrapper']}>
              <EditableTextArea
                value={keyMeta.meta.description}
                onTextChanged={text => onDescriptionChanged(text)}
                placeHolder="Write key description"
                title="Click to edit description"
                classNames={{ input: style['description-input'] }}
                maxLength={400}
              />
            </div>

            <div className={style['tags-wrapper']}>
              <KeyTags
                onTagsChanged={newTags => onTagsChanged(newTags)}
                tags={keyMeta.meta.tags || []}
              />
            </div>
          </div>

        </fieldset>

      </div>

    </div>
  );
};

const HeaderMainInput = (props) => {
  const { isInAddMode, onKeyNameChanged, onDisplayNameChanged, keyMeta, isReadonly } = props;
  return (
    <div className={style['key-main-input']}>
      {isInAddMode ?
        <div className={style['new-key-input-wrapper']}>
          <NewKeyInput onKeyNameChanged={name => onKeyNameChanged(name)} displayName={keyMeta.displayName} />
          <div className={style['vertical-separator']} />
          <KeyValueTypeSelector value={keyMeta.valueType} />
        </div>
        :
        <EditableText
          onTextChanged={text => onDisplayNameChanged(text)}
          placeHolder="Enter key display name" maxLength={80}
          value={keyMeta.meta.name} isReadonly={isReadonly}
          classNames={{
            container: style['display-name-container'],
            input: style['display-name-input'],
            text: style['display-name-text'],
            form: style['display-name-form'],
          }}
        />}
    </div>
  );
};

const getKeyPrefix = path => R.slice(0, -1, path.split('/')).join('/');
const getSugesstions = R.pipe(R.map(getKeyPrefix), R.uniq(), R.filter(x => x !== ''));

function getKeyNameSuggestions(keysList) {
  return getSugesstions(keysList).sort();
}

const NewKeyInput = compose(
  connect(state => ({ keysList: state.keys, keyNameValidation: state.selectedKey.validation.key })),
)(({
  keysList,
  keyNameValidation,
  onKeyNameChanged,
  displayName,
}) => {
  const suggestions = getKeyNameSuggestions(keysList).map(x => ({ label: x, value: x }));
  return (
    <div className={style['auto-suggest-wrapper']} data-with-error={keyNameValidation.isShowingHint}>
      <div className={style['validation-icon-wrapper']} data-is-shown={keyNameValidation.isShowingHint}>
        <img
          className={style['validation-icon']}
          data-tip={keyNameValidation.hint}
          src={alertIconSrc}
        />
      </div>
      <ComboBox
        options={suggestions}
        placeholder="Enter key full path"
        onInputChange={text => onKeyNameChanged(text)}
        showValueInOptions
        className={style['auto-suggest']}
        selected={displayName && displayName != '' ? [displayName] : []}
      />
      <ReactTooltip
        disable={!keyNameValidation.isShowingHint}
        effect="solid"
        place="top"
        delayHide={500}
      />
    </div>
  );
});
