import moment from 'moment';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import Calendar from 'react-calendar';
import './Calendar.css';

import './DateInput.css';
import Input from './Input';

const DateInput = ({ onChange, value, ...props }) => {
  const [showCalendar, setShowCalendar] = useState(false);

  const dateValue = moment.utc(value);
  const calendarDate = ((dateValue.isValid() && dateValue) || moment()).toDate();

  const onFocus = (evt) => {
    evt.preventDefault();
    setShowCalendar(true);
  };
  const onBlur = (evt) => {
    if (evt.relatedTarget === null || !evt.relatedTarget.className.includes('react-calendar')) {
      evt.preventDefault();
      // We need this timeout, when calendar is clicked, so it can call onChange
      setTimeout(() => setShowCalendar(false), 100);
    }
  };

  const changeDate = (newDate) => {
    onChange(moment(newDate).utc(true).format());
    setShowCalendar(false);
  };
  return (
    <div onBlur={onBlur} className="date-input">
      <Input {...props} onChange={onChange} onFocus={onFocus} value={value} />
      {showCalendar ? (
        <div className="calendar">
          <div className="wrapper">
            <div className="container">
              <Calendar
                className="calendar"
                onChange={changeDate}
                value={calendarDate}
                calendarType="ISO 8601"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

DateInput.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string,
};

export default DateInput;
