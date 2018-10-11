import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Calendar from 'react-calendar/dist/entry.nostyle';
import moment from 'moment';
import { withState, compose } from 'recompose';
import Input from './Input';

import './DateInput.css';
import './Calendar.css';


const DateInput = compose(
  withState('showCalendar', 'setShowCalendar', false)
)(({ onChange, value, showCalendar, setShowCalendar, ...props }) => {
  let calendarDate = value ? new Date(value) : new Date();
  if(isNaN(calendarDate)) {
    calendarDate = new Date();
  }

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
        showCalendar ?
          (<div className="calendar wrapper">
            <div className="calendar container">
              <Calendar
                className="calendar"
                onChange={newDate => onChange(moment(newDate).utc().format())}
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
