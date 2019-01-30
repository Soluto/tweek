import React from 'react';
import PropTypes from 'prop-types';
import Calendar from 'react-calendar/dist/entry.nostyle';
import moment from 'moment';
import { withState, compose } from 'recompose';
import Input from './Input';

import './DateInput.css';
import './Calendar.css';

const DateInput = compose(withState('showCalendar', 'setShowCalendar', false))(
  ({ onChange, value, showCalendar, setShowCalendar, ...props }) => {
    const calendarDate = moment.utc(value).toDate();

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
      onChange(
        moment(newDate)
          .utc(true)
          .format(),
      );
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
  },
);

DateInput.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string,
};

export default DateInput;
