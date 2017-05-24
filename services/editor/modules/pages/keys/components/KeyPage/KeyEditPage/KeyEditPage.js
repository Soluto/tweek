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
import TypedInput from '../../../../../components/common/Input/TypedInput';

const ConstEditor = props => <TypedInput {...props} />;

const Editor = ({ manifest, sourceFile, onManifestChange, onSourceFileChange, isReadonly, alerter }) => {
  if (manifest.implementation.type === 'file') {
    let FileEditor = null;
    if (manifest.implementation.format === 'jpad') {
      FileEditor = JPadFullEditor;
    }
    return (<FileEditor
      alerter={alerter}
      source={sourceFile}
      onChange={onSourceFileChange}
      dependencies={manifest.dependencies}
      onDependencyChanges={dependencies => onManifestChange({ ...manifest, dependencies })}
      isReadonly={isReadonly}
      valueType={manifest.valueType}
    />);
  }
  if (manifest.implementation.type === 'const') {
    return <ConstEditor value={manifest.implementation.value} valueType={manifest.valueType} onChange={value => onManifestChange({ ...manifest, implementation: { ...manifest.implementation, value } })} />;
  }
  return null;
};

class KeyEditPage extends Component {
  constructor(props) {
    super(props);
    this.onKeyNameChanged = this.onKeyNameChanged.bind(this);
    this.onDisplayNameChanged = this.onDisplayNameChanged.bind(this);
  }

  onTagsChanged(newTags) {
    const oldManifest = this.props.selectedKey.local.manifest;
    const newManifest = {
      ...oldManifest,
      meta: {
        ...oldManifest.meta,
        tags: newTags,
      },
    };
    this.onSelectedKeyMetaChanged(newManifest);
  }

  onKeyNameChanged(newKeyName) {
    this.props.updateKeyName(newKeyName);
  }

  onDisplayNameChanged(newDisplayName) {
    const oldManifest = this.props.selectedKey.local.manifest;
    const newManifest = {
      ...oldManifest,
      meta: {
        ...oldManifest.meta,
        name: newDisplayName,
      },
    };
    this.onSelectedKeyMetaChanged(newManifest);
  }

  onDescriptionChanged(newDescription) {
    const oldManifest = this.props.selectedKey.local.manifest;
    const newManifest = {
      ...oldManifest,
      meta: {
        ...oldManifest.meta,
        description: newDescription,
      },
    };
    this.onSelectedKeyMetaChanged(newManifest);
  }

  onSelectedKeyMetaChanged(newManifest) {
    this.props.updateKeyMetaDef(newManifest);
  }


  render() {
    const { selectedKey, isInAddMode, isInStickyMode, alerter, revision } = this.props;
    const { key, local: { manifest, keyDef, revisionHistory } } = selectedKey;
    const isHistoricRevision = (revision && revisionHistory[0].sha !== revision);
    const isReadonly = (!!manifest.meta.readOnly && manifest.meta.readOnly) || isHistoricRevision;

    const commonHeadersProps = {
      onKeyNameChanged: this.onKeyNameChanged,
      onDisplayNameChanged: this.onDisplayNameChanged,
      isInAddMode,
      isHistoricRevision,
      isReadonly,
      keyManifest: manifest,
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

            <div className={classNames(style['key-rules-editor'], { [style.sticky]: isInStickyMode })}>
              <Editor
                manifest={manifest}
                sourceFile={keyDef.source}
                onSourceFileChange={source => this.props.updateKeyDef({ source })}
                onManifestChange={newManifest => this.onSelectedKeyMetaChanged(newManifest)}
                isReadonly={isReadonly}
                alerter={alerter}
              />
            </div>
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
    keyManifest,
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
                value={keyManifest.meta.description}
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
                tags={keyManifest.meta.tags || []}
              />
            </div>
          </div>

        </fieldset>

      </div>

    </div>
  );
};

const HeaderMainInput = (props) => {
  const { isInAddMode, onKeyNameChanged, onDisplayNameChanged, keyManifest, isReadonly } = props;
  return (
    <div className={style['key-main-input']}>
      {isInAddMode ?
        <div className={style['new-key-input-wrapper']}>
          <NewKeyInput onKeyNameChanged={name => onKeyNameChanged(name)} displayName={keyManifest.displayName} />
          <div className={style['vertical-separator']} />
          <KeyValueTypeSelector value={keyManifest.valueType} />
        </div>
        :
        <EditableText
          onTextChanged={text => onDisplayNameChanged(text)}
          placeHolder="Enter key display name" maxLength={80}
          value={keyManifest.meta.name} isReadonly={isReadonly}
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
        selected={displayName && displayName !== '' ? [displayName] : []}
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
