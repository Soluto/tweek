import moment from 'moment';
import React, { FocusEventHandler, useState } from 'react';
import Calendar, { OnChangeDateCallback } from 'react-calendar';
import './Calendar.css';
import './DateInput.css';
import Input, { InputProps } from './Input';

const DateInput = ({ onChange, value, ...props }: InputProps) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const dateValue = moment.utc(value);
  const calendarDate = ((dateValue.isValid() && dateValue) || moment()).toDate();

  const onFocus: FocusEventHandler = (evt) => {
    evt.preventDefault();
    setShowCalendar(true);
  };

  const onBlur: FocusEventHandler = (evt) => {
    if (
      evt.relatedTarget === null ||
      !(evt.relatedTarget as Element).className.includes('react-calendar')
    ) {
      evt.preventDefault();
      // We need this timeout, when calendar is clicked, so it can call onChange
      setTimeout(() => setShowCalendar(false), 100);
    }
  };

  const changeDate: OnChangeDateCallback = (newDate) => {
    if (Array.isArray(newDate)) {
      newDate = newDate[0];
    }
    onChange && onChange(moment(newDate).utc(true).format());
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

export default DateInput;
