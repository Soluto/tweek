import React, { FunctionComponent } from 'react';
import './Label.css';

const Label: FunctionComponent = ({ children }) => <label data-comp="label">{children}</label>;

export default Label;
