import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Calendar from 'react-calendar';
import moment from 'moment';
import Input from './Input';

import './DateInput.css';

//const DateInput = ({ onChange, value, ...props }) => {
class DateInput extends Component {
  constructor(props) {
    super(props);
    this.state = { showCalendar: false };
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
  }

  onFocus(evt) {
    evt.preventDefault();
    this.setState({ showCalendar: true });
  }

  onBlur(evt) {
    evt.preventDefault();
    // We need this timeout, when calendar is clicked, so it can call onChange
    setTimeout(() => this.setState({ showCalendar: false }), 100);
  }

  render() {
    const { onChange, value, ...props } = this.props;
    return (
      <div>
        <Input {...props} onChange={onChange} onFocus={this.onFocus} onBlur={this.onBlur} value={value} />
        {
          this.state.showCalendar ?
            (<div className="calendar wrapper">
              <div className="calendar container">
                <Calendar
                  className="calendar"
                  onChange={newDate => onChange(moment(newDate).format("L"))}
                  value={new Date(value || new Date())}
                />
              </div>
            </div>) : null
        }
      </div>
    );
  }
}

export default DateInput;
