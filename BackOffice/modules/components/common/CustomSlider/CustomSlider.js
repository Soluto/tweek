import React from 'react';
import { DraggableCore } from 'react-draggable';
import R from 'ramda';
import Mutator from '../../../utils/mutator';
import style from './CustomSlider.css';

function replaceNaN(fallbackValue) { return isNaN(this) ? fallbackValue : this; }
const parseNumericInput = (inputValue) => inputValue === '' ? 0 : parseInt(inputValue);

export default ({ data, onUpdate, sliderColors, displaySliderDragger = true, displayLegend = true }) => {
  const items = R.zip(sliderColors, R.toPairs(data)).map(([sliderColor, [value, weight]]) => ({
    value, weight, sliderColor,
  }));

  const mutator = Mutator.stateless(() => data, onUpdate);
  return (
    <div className={style['custom-slider-container']}>
      {displayLegend ?
        <div className={style['legend-bar']}>
          <div className={style['variant-list']}>
            {items.map(({ value, weight, sliderColor }, i) =>
              <div className= { style['legend-item']} >
                <button className={style['delete-legend-button']}
                  title="Remove variant"
                  onClick={() => mutator.apply(m => {
                    const itemToUpdate = items[i === 0 ? 1 : i - 1];
                    return m.in(value).delete().in(itemToUpdate.value).updateValue(itemToUpdate.weight + weight);
                  }) }
                >x</button>
                <div className={style['vertical-accent']} style={{ backgroundColor: sliderColor }} />
                <input type="text" className={style['legend-value-input']} onChange={e => mutator.in(value).updateKey(e.target.value) } value={value} />
                <input type="text"
                  className={style['legend-precent-input']}
                  onChange={({ target: { value: newWeight } }) => mutator.in(value).updateValue((parseNumericInput(newWeight)):: replaceNaN(weight)) }
                  onWheel={({ deltaY }) => {
                  const currentValue = mutator.in(value).getValue();
                  const newValue = deltaY < 0 ? currentValue + 1 : currentValue - 1;
                  if (newValue < 0 || newValue > 100) return;
                  mutator.in(value).updateValue(newValue);
                } }
                  value={weight}
                />
              </div>
            ) }
          </div>
          {(items.length !== sliderColors.length) ?
            <button title="Add variant"
              className={style['add-legend-button']}
              onClick={() => mutator.insert(`value #${items.length + 1}`, 0) }
            >
              +
            </button> : null
          }
        </div> : null
      }
      <div className={style['horizontal-variant-slider-wrapper']}>
        {items.map(({ sliderColor, weight, value }, i) =>
          (<div className={style['horizontal-variant-slider']} >
            <div className={style['horizontal-accent']} style={{ width: parseFloat(weight), backgroundColor: sliderColor }} />
            {displaySliderDragger && i < (items.length - 1) ?
              <DraggableCore onDrag={(_, data) => {
                if (items[i + 1].weight - (data.deltaX) < 0) return;
                if (items[i].weight + (data.deltaX) < 0) return;
                mutator.apply(m => m.in(items[i + 1].value).updateValue(items[i + 1].weight - data.deltaX)
                  .up()
                  .in(value).updateValue(weight + data.deltaX));
              } }
                axis="x"
              >
                <div>
                  <div className={style['dragger']}>
                    <label style={{ zIndex: 1000 - i }} className={style['arrow']} ></label>
                  </div>
                </div>
              </DraggableCore>
              : null}
          </div>
          )) }
      </div>
    </div >
  );
};
