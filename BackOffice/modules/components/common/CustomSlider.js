import React from 'react';
import {DraggableCore} from 'react-draggable';
import R from 'ramda';
import Mutator from '../../utils/mutator';

function replaceNaN(fallbackValue) {return isNaN(this) ? fallbackValue : this;}
const parseNumericInput = (inputValue) => inputValue === '' ? 0 : parseInt(inputValue);

const LegendStyle = {
  Bar: { border: '2px solid #969696', padding: 6 },
  Item: { display: 'flex' },
  Icon: (color) => ({ backgroundColor: color, width: 24, height: 24 }),
  Label: { marginRight: '4px' },
};

export default ({ data, onUpdate, displayLegend = true }) => {
  const colors = ['green', 'red', 'blue', 'yellow', 'black', 'grey'];
  const items = R.zip(colors, R.toPairs(data)).map(([color, [value, weight]]) => ({
    value, weight, color,
  }));

  const mutator = Mutator.stateless(() => data, onUpdate);
  return (<div style={{ display: 'flex' }}>
    {displayLegend ?
    <div style={LegendStyle.Bar}>
    {items.map(({ color, value, weight }, i) =>
      <div style={LegendStyle.Item}>
        <div style={{ cursor: 'pointer', color: 'red' }} onClick={() => mutator.apply(m => {
          const itemToUpdate = items[i === 0 ? 1 : i - 1];
          return m.in(value).delete().in(itemToUpdate.value).updateValue(itemToUpdate.weight + weight);
        })}>X</div>
        <div style={LegendStyle.Icon(color)} />
        <input type="text" style={{ ...LegendStyle.Label, width: 150 }} onChange={e => mutator.in(value).updateKey(e.target.value)} value={value} />
        <input type="text" style={{ ...LegendStyle.Label, width: 70 }} onChange={({ target: { value: newWeight } }) => mutator.in(value).updateValue((parseNumericInput(newWeight))::replaceNaN(weight)) } value={weight} />
      </div>)}
      <button onClick={() => mutator.insert(`value #${items.length + 1}`, 0) }>+</button>
    </div> : null}
    <div style={{ alignSelf: 'center', padding: 10, display: 'flex' }}>
      {items.map(({ color, weight, value }, i) =>
      (<div style={{ display: 'flex', alignItems: 'center' }} >
        <div style={{ height: 30, backgroundColor: color, width: parseFloat(weight) }} />
          {i < (items.length - 1) ?
          <DraggableCore onDrag={(_, data) =>
            {
            if (items[i + 1].weight - (data.deltaX) < 0) return;
            if (items[i].weight + (data.deltaX) < 0) return;
            mutator.apply(m => m.in(items[i + 1].value).updateValue(items[i + 1].weight - data.deltaX)
            .up()
            .in(value).updateValue(weight + data.deltaX));
          }
        } axis="x"
          >
          <div style={{ backgroundColor: 'black', cursor: 'col-resize', width: 5, height: 40 }} />
          </DraggableCore>
          : null}
        </div>
      ))}
    </div>
  </div>);
};
