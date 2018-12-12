import React from 'react';
import { compose, withHandlers, withState, withProps, withPropsOnChange } from 'recompose';
import '../index.css';
import { JsonTree } from 'react-editable-json-tree';

class StringCell extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: props.data,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.data !== this.props.data) {
      this.setState({ value: this.props.data });
    }
  }

  onValueChanged = e => this.setState({ value: e.target.value });

  onBlur = e => this.props.onEdit(e.target.value);

  render() {
    const { value } = this.state;

    return (
      <input
        type="text"
        name="theInput"
        className="editable-cell"
        value={value}
        onChange={this.onValueChanged}
        onBlur={this.onBlur}
      />
    );
  }
}

export default ({ onEdit, data, cellType, cellPosition }) => {
  switch (cellType) {
  case 'string':
    return <StringCell onEdit={onEdit} data={data} cellPosition={cellPosition} />;
  case 'yes-or-no':
    return <StringCell onEdit={onEdit} data={data} />;
  case 'json':
    return <JsonTree onFullyUpdate={onEdit} data={data} />;
  default:
    return null;
  }
};
