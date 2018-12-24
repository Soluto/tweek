import React from 'react';
import { compose, withHandlers } from 'recompose';
import '../index.css';
import { JsonTree } from 'react-editable-json-tree';
import Switch from 'react-switch';

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

export default compose(
  withHandlers({
    onToggleChange: ({ onEdit, columnSpecificProps }) => checked =>
      checked
        ? onEdit(columnSpecificProps.toggleOnValue)
        : onEdit(columnSpecificProps.toggleOffValue),
  }),
)(({ onEdit, data, cellType, cellPosition, onToggleChange, columnSpecificProps }) => {
  switch (cellType) {
  case 'string':
    return <StringCell onEdit={onEdit} data={data} cellPosition={cellPosition} />;
  case 'toggle':
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <Switch
          onColor={'#009fda'}
          onChange={onToggleChange}
          checked={data === columnSpecificProps.toggleOnValue}
        />
      </div>
    );
  case 'json':
    return <JsonTree onFullyUpdate={onEdit} data={data} />;
  default:
    return null;
  }
});
