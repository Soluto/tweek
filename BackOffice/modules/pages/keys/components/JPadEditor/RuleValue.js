import React from 'react';
import R from 'ramda';
import Chance from 'chance';
import ToolTip from 'react-portal-tooltip';
import { withState } from 'recompose';
import Draggable, { DraggableCore } from 'react-draggable';
import Mutator from '../../../../utils/Mutator';

const LegendStyle = {
  Bar: { border: '2px solid #969696', padding: 6 },
  Item: {},
  Icon: (color) => ({ display: 'inline-block', backgroundColor: color, width: 24, height: 24 }),
  Label: { display: 'inline-block' },
};

let CustomSlider = withState('hoverItem', 'setHoverItem', -1)(({ variants, hoverItem, setHoverItem, onUpdate, displayLegend = true }) => {
  const chance = new Chance();
  const colors = ['red', 'green', 'blue', 'yellow'];
  const items = R.zip(colors, R.toPairs(variants)).map(([color, [value, weight]]) => ({
    value, weight, color,
  }));
  const tooltipHandlers = (index) => ({
    onMouseEnter: () => setHoverItem(index),
    omMouseMove: () => setHoverItem(index),
  });
  const tipElementPrefix = `t${chance.guid()}`;
  const mutator = Mutator.stateless(() => variants, onUpdate);
  return (<div onMouseLeave={() => setHoverItem(-1)} style={{ display: 'flex' }}>
    {displayLegend ?
    <div style={LegendStyle.Bar}>
    {items.map(({ color, value, weight, tipId = `t${chance.guid()}` }, i) =>
      <div {...tooltipHandlers(i)} style={LegendStyle.Item}>
        <div style={LegendStyle.Icon(color)} />
        <input style={{ ...LegendStyle.Label, width: 150 }} onChange={e => mutator.in(value).updateKey(e.target.value)} value={value} />
        <input style={{ ...LegendStyle.Label, width: 70 }} onChange={e => mutator.in(value).updateValue(parseFloat(e.target.value) || weight) } value={weight} />
      </div>)}
    </div> : null}
    <div style={{ alignSelf: 'center', padding: 10, display: 'flex' }}>
      {items.map(({ color, weight, value }, i) =>
      (<div style={{ display: 'flex', alignItems: 'center' }} >
          <div {...tooltipHandlers(i)} id={`${tipElementPrefix}${i}`} style={{ height: 30, backgroundColor: color, width: parseFloat(weight) * 2 }} />
          {i < (items.length - 1) ?
          <DraggableCore onDrag={(_, data) =>
            {
            if (items[i + 1].weight - (data.deltaX * 0.5) < 0) return;
            if (items[i].weight + (data.deltaX * 0.5) < 0) return;
            mutator.apply(m => m.in(items[i + 1].value).updateValue(items[i + 1].weight - data.deltaX * 0.5)
            .up()
            .in(value).updateValue(weight + data.deltaX * 0.5));
          }
        } axis="x"
          >
          <div style={{ backgroundColor: 'black', cursor: 'col-resize', width: 5, height: 40 }} />
          </DraggableCore>
          : null}
        </div>
      ))}
    <ToolTip active={hoverItem !== -1} position="top" parent={`#${tipElementPrefix}${hoverItem}`}>
            <div style={{ padding: 10 }}>{items[hoverItem] && (`${items[hoverItem].value} : ${items[hoverItem].weight}`)}</div>
    </ToolTip>
    </div>
  </div>);
});

let SingleVariantValue = ({ value, onUpdate }) => (
    (<div><textarea value={value} onChange={e => onUpdate(e.target.value) } /></div>)
);

let MultiVariantValue = ({ valueDistrubtion: { type, args }, mutate }) => {
  if (type === 'weighted')
    return (<div>
        {
            <CustomSlider variants={args} onUpdate={mutate.in('args').updateValue } />
            // R.toPairs(args).map(([value, weight]) => (<div>{`${value}:${weight}`}</div>))
        }
        </div>);
  if (type === 'bernoulliTrial') {
    return (<div>
    <CustomSlider displayLegend={false}
      variants={{ true: 1000 * parseFloat(args) / 10, false: 100 - (1000 * parseFloat(args) / 10) }}
      onUpdate={x => mutate.in('args').updateValue(x.true / 100)}

    />
    <button onClick={() => mutate.apply(m =>
      m.up()
      .in('Value').updateValue('true').up()
      .in('Type').updateValue('SingleVariant').up()
      .in('ValueDistribution').delete()
    )}>Set to true</button>
    <button onClick={() => mutate.apply(m =>
      m.up()
      .in('Value').updateValue('true').up()
      .in('Type').updateValue('SingleVariant').up()
      .in('ValueDistribution').delete()
    )}>Set to false</button>
    </div>
    );
  }
  return null;
};

export default ({ rule, mutate }) => {
  if (rule.Type === 'SingleVariant')
    return (<SingleVariantValue onUpdate={mutate.in('Value').updateValue} value={rule.Value} />);
  if (rule.Type === 'MultiVariant')
    return (<MultiVariantValue mutate={mutate.in('ValueDistribution')} valueDistrubtion={rule.ValueDistribution} />);
  return null;
};
