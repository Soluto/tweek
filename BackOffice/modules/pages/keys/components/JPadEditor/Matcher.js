import React from 'react';
import R from 'ramda';
import { Matcher as MatcherStyle,
        MatcherProperty as MatcherPropertyStyle } from './JPadEditor.css';
import EditorMetaService from '../../../../services/EditorMetaService';
import PropertyName from './matcher/PropertyName';
import PropertyPredicate from './matcher/PropertyPredicate';
import { shouldUpdate } from 'recompose';

const editorMetaService = new EditorMetaService();
editorMetaService.init();

const Property = ({ property, predicate, mutate, suggestedValues = [] }) =>
        (<div className={MatcherPropertyStyle}>
           <div style={{ color: 'red', fontSize: '24px', lineHeight: '34px', cursor: 'pointer' }} onClick={mutate.delete}>x</div>
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

  return (<div className={MatcherStyle}>
  {
        props.map(([property, predicate], i) => {
          const allSuggestions = editorMetaService.getSuggestions({ type: 'MatcherProperty', query: { input: '' } });
          const suggestedValues = filterActiveProps(property)(allSuggestions);
          return (
            <Property mutate={mutate.in(property)} key={i}
              {...{ suggestedValues, property, predicate }}
            />
          ); })
    }
    <div style={{ color: 'blue', fontSize: '24px', lineHeight: '34px', cursor: 'pointer' }} onClick={() => mutate.insert('', '')}>+</div>
    </div>);
});
