import React from 'react';
import { DraggableCore } from 'react-draggable';
import * as R from 'ramda';
import Mutator from '../../../utils/mutator';
import TypedInput from '../Input/TypedInput';
import Input from '../Input/Input';
import './CustomSlider.css';

function replaceNaN(fallbackValue) {
  return isNaN(this) ? fallbackValue : this;
}
const parseNumericInput = (inputValue) => (inputValue === '' ? 0 : parseInt(inputValue, 10));

const LegendItem = ({
  onDelete,
  onValueChanged,
  onWeightChanged,
  valueType,
  value,
  weight,
  sliderColor,
}) => (
  <div data-comp="legend-item" className="legend-item">
    <button
      data-comp="delete-legend-button"
      className="delete-legend-button"
      title="Remove variant"
      onClick={onDelete}
    />
    <div className={'vertical-accent'} style={{ backgroundColor: sliderColor }} />
    <TypedInput
      data-comp="legend-value"
      className="legend-value-input"
      hideIcon
      value={value}
      valueType={valueType}
      onChange={onValueChanged}
    />
    <Input
      data-comp="legend-percent"
      className="legend-percent-input"
      value={weight}
      onChange={(newWeight) =>
        onWeightChanged(replaceNaN.call(parseNumericInput(newWeight), weight))
      }
      onWheel={({ deltaY }) => {
        const newValue = Math.min(100, Math.max(0, deltaY < 0 ? weight + 1 : weight - 1));
        if (newValue === weight) return;
        onWeightChanged(newValue);
      }}
    />
  </div>
);

const CustomSlider = ({
  data,
  valueType,
  onUpdate,
  sliderColors,
  displaySliderDragger = true,
  displayLegend = true,
}) => {
  const items = R.zip(sliderColors, data).map(([sliderColor, item]) => ({
    ...item,
    sliderColor,
  }));

  const mutator = Mutator.stateless(() => data, onUpdate);
  return (
    <div data-comp="custom-slider" className="custom-slider-container">
      {displayLegend ? (
        <div data-comp="legend-bar" className="legend-bar">
          <div className={'variant-list'}>
            {items.map(({ value, weight, sliderColor }, i) => (
              <LegendItem
                key={i}
                value={value}
                weight={weight}
                sliderColor={sliderColor}
                valueType={valueType}
                onDelete={() =>
                  mutator.apply((m) => {
                    const itemToUpdate = i === 0 ? 1 : i - 1;
                    m.in(itemToUpdate)
                      .in('weight')
                      .adjustValue(R.add(weight));
                    m.in(i).delete();
                    return m;
                  })
                }
                onValueChanged={(newValue) =>
                  mutator
                    .in(i)
                    .in('value')
                    .updateValue(newValue)
                }
                onWeightChanged={(newWeight) =>
                  mutator
                    .in(i)
                    .in('weight')
                    .updateValue(newWeight)
                }
              />
            ))}
          </div>
          {items.length !== sliderColors.length ? (
            <button
              title="Add variant"
              data-comp="add-variant-button"
              className="add-variant-button"
              onClick={() => mutator.append({ value: `value #${items.length + 1}`, weight: 0 })}
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
                  mutator.apply((m) => {
                    m.in(i)
                      .in('weight')
                      .adjustValue(R.add(data.deltaX));
                    m.in(i + 1)
                      .in('weight')
                      .adjustValue(R.subtract(R.__, data.deltaX));
                    return m;
                  });
                }}
                axis="x"
              >
                <div>
                  <div className={'dragger'}>
                    <label style={{ zIndex: items.length - i }} className={'arrow'} />
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
