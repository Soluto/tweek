import React from 'react';
import R from 'ramda';
import style from './Matcher.css';
import EditorMetaService from '../../../../../services/EditorMetaService';
import PropertyName from './Properties/PropertyName';
import PropertyPredicate from './Properties/PropertyPredicate';
import { shouldUpdate } from 'recompose';
import classNames from 'classnames';

const editorMetaService = new EditorMetaService();
editorMetaService.init();

const Property = ({ property, predicate, mutate, suggestedValues = [] }) =>
  (<div className={style['conditions-wrapper']}>
    <div className={style['delete-condition-button']} onClick={mutate.delete}>x</div>
    <PropertyName {...{ property, mutate, suggestedValues }} />
    <PropertyPredicate {...{ predicate, mutate, property }} />
  </div>);

const hasChanged = shouldUpdate((props, nextProps) =>
  !R.equals(props.matcher, nextProps.matcher) ||
  !R.equals(props.mutate.path, nextProps.mutate.path));

export default hasChanged(({ matcher, mutate }) => {
  const [ops, props] = R.pipe(R.toPairs, R.partition(([prop]) => prop[0] === '$'))(matcher);
  const IgnoreActivePropsPropsPredicate = R.compose(R.not, R.contains(R.__, R.map(R.head, props)));

  const filterActiveProps = (currentProp) => (propsWithMeta) =>
    propsWithMeta.filter(x => x.value === currentProp || IgnoreActivePropsPropsPredicate(x.value));

  return (
    <div className={style['matcher']}>
      {
        props.map(([property, predicate], i) => {
          const allSuggestions = editorMetaService.getSuggestions({ type: 'MatcherProperty', query: { input: '' } });
          const suggestedValues = filterActiveProps(property)(allSuggestions);
          return (
            <Property mutate={mutate.in(property) } key={i}
              {...{ suggestedValues, property, predicate }}
            />
          );
        })
      }
      <button className={classNames(style['add-condition-button'], { [style['big']]: props.length === 0 }) }
        onClick={() => mutate.insert('', '') }
        title="Add condition"
      >+</button>
    </div>);
});
