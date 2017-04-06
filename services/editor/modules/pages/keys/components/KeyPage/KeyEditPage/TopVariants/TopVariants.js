import React from 'react';
import { mapPropsStream, mapProps, compose } from 'recompose';
import { Observable } from 'rxjs';
import { generate as calculateTopVariantsData } from './topVariantsGenerator';

const withVariants = mapPropsStream(props$ => {

  const variants$ = props$.pluck('keyPath').distinctUntilChanged()
    .switchMap(keyPath => fetch(`http://localhost:4005/api/v1/funnel/${keyPath}`))
    .flatMap(response => response.json());
  
  return Observable.combineLatest(props$, variants$.startWith(null), (props, variants) => 
    ({...props, variants})
  );
});

const withTopVariants = mapProps(({variants, ...otherProps}) => ({
  ...otherProps,
  topVariants: calculateTopVariantsData(variants)
}));

const Variant = ({variant, funnelStart, funnelComplete, percentage, rank}) => 
  <div style={{width: 200, justifyContent: 'center', alignContent: 'center', marginTop: 42, marginRight: 33, marginLeft: 33}}>
    <div style={{color: '#949494', fontSize: 16, marginBottom: 37, textAlign: 'center'}}>{variant}</div>
    <div style={{fontSize: 36, fontWeight: 'bold', textAlign: 'center', marginBottom: 7}}>{(percentage * 100).toFixed(2) + "%"}</div>
    <div style={{color: '#999999', fontSize: 13, textAlign: 'center', marginBottom: 16}}>{`${funnelComplete} / ${funnelStart}`}</div>
  </div>

const Renderer = ({topVariants}) => 
  <div style={{flex: 1}} >
    <label style={{color: '#5a5a5a', fontSize: 16, marginBottom: 5}}>Top Variants</label>
    <div style={{display: 'flex', justifyContent: 'space-between', flex: 1, flexDirection: 'row', 
    marginLeft: 70, marginRight: 70}}>
      {
        topVariants.map((variantDetails, index) =>
          <Variant {...variantDetails} rank={index + 1} key={index} />
        )
      }
    </div>
  </div>;

const enhance = compose(withVariants, withTopVariants);

export default enhance(Renderer);