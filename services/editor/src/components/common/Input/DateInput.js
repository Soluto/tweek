import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Calendar from 'react-calendar';
import moment from 'moment';
import { withState, compose } from 'recompose';
import Input from './Input';

import './DateInput.css';


const DateInput = compose(
  withState('showCalendar', 'setShowCalendar', false)
)(({ onChange, value, showCalendar, setShowCalendar, ...props }) => {
  // const { onChange, value, ...props } = this.props;
  const calendarDate = value ? new Date(value) : new Date();

  const onFocus = (evt) => {
    evt.preventDefault();
    setShowCalendar(true);
  };
  const onBlur = (evt) => {
    evt.preventDefault();
    // We need this timeout, when calendar is clicked, so it can call onChange
    setTimeout(() => setShowCalendar(false), 100);
  };

  return (
    <div>
      <Input {...props} onChange={onChange} onFocus={onFocus} onBlur={onBlur} value={value} />
      {
        showCalendar && !isNaN(calendarDate) ?
          (<div className="calendar wrapper">
            <div className="calendar container">
              <Calendar
                className="calendar"
                onChange={newDate => onChange(moment(newDate).format("L"))}
                value={calendarDate}
              />
            </div>
          </div>) : null
      }
    </div>
  );
});

DateInput.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string,
};

export default DateInput;
