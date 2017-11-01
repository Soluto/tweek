import React from 'react';
import { DraggableCore } from 'react-draggable';
import * as R from 'ramda';
import Mutator from '../../../utils/mutator';
import './CustomSlider.css';

function replaceNaN(fallbackValue) {
  return isNaN(this) ? fallbackValue : this;
}
const parseNumericInput = inputValue => (inputValue === '' ? 0 : parseInt(inputValue, 10));

const CustomSlider = ({
  data,
  onUpdate,
  sliderColors,
  displaySliderDragger = true,
  displayLegend = true,
}) => {
  const items = R.zip(sliderColors, R.toPairs(data)).map(([sliderColor, [value, weight]]) => ({
    value,
    weight,
    sliderColor,
  }));

  const mutator = Mutator.stateless(() => data, onUpdate);
  return (
    <div data-comp="custom-slider" className="custom-slider-container">
      {displayLegend ? (
        <div data-comp="legend-bar" className="legend-bar">
          <div className={'variant-list'}>
            {items.map(({ value, weight, sliderColor }, i) => (
              <div key={i} data-comp="legend-item" className="legend-item">
                <button
                  data-comp="delete-legend-button"
                  className="delete-legend-button"
                  title="Remove variant"
                  onClick={() =>
                    mutator.apply((m) => {
                      const itemToUpdate = items[i === 0 ? 1 : i - 1];
                      return m
                        .in(value)
                        .delete()
                        .in(itemToUpdate.value)
                        .updateValue(itemToUpdate.weight + weight);
                    })}
                />
                <div className={'vertical-accent'} style={{ backgroundColor: sliderColor }} />
                <input
                  type="text"
                  data-comp="legend-value"
                  className="legend-value-input"
                  onChange={e => mutator.in(value).updateKey(e.target.value)}
                  value={value}
                />
                <input
                  type="text"
                  data-comp="legend-percent"
                  className="legend-percent-input"
                  onChange={({ target: { value: newWeight } }) =>
                    mutator
                      .in(value)
                      .updateValue(replaceNaN.call(parseNumericInput(newWeight), weight))}
                  onWheel={({ deltaY }) => {
                    const currentValue = mutator.in(value).getValue();
                    const newValue = deltaY < 0 ? currentValue + 1 : currentValue - 1;
                    if (newValue < 0 || newValue > 100) return;
                    mutator.in(value).updateValue(newValue);
                  }}
                  value={weight}
                />
              </div>
            ))}
          </div>
          {items.length !== sliderColors.length ? (
            <button
              title="Add variant"
              data-comp="add-variant-button"
              className="add-variant-button"
              onClick={() => mutator.insert(`value #${items.length + 1}`, 0)}
            />
          ) : null}
        </div>
      ) : null}
      <div className={'horizontal-variant-slider-wrapper'}>
        {items.map(({ sliderColor, weight, value }, i) => (
          <div key={i} className={'horizontal-variant-slider'}>
            <div
              className={'horizontal-accent'}
              style={{ width: parseFloat(weight), backgroundColor: sliderColor }}
            />
            {displaySliderDragger && i < items.length - 1 ? (
              <DraggableCore
                onDrag={(_, data) => {
                  if (items[i + 1].weight - data.deltaX < 0) return;
                  if (items[i].weight + data.deltaX < 0) return;
                  mutator.apply(m =>
                    m
                      .in(items[i + 1].value)
                      .updateValue(items[i + 1].weight - data.deltaX)
                      .up()
                      .in(value)
                      .updateValue(weight + data.deltaX),
                  );
                }}
                axis="x"
              >
                <div>
                  <div className={'dragger'}>
                    <label style={{ zIndex: 1000 - i }} className={'arrow'} />
                  </div>
                </div>
              </DraggableCore>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomSlider;
