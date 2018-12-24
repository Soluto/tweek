import React from 'react';
import { compose, withHandlers, withProps } from 'recompose';
import ReactTable from 'react-table';
import Cell from './Cell';
import 'react-table/react-table.css';
import '../index.css';
import './index.css';

const EditableTable = ({ columns, data }) => (
  <ReactTable
    data={data}
    columns={columns}
    filterable
    defaultFilterMethod={(filter, row) => row[filter.id].indexOf(filter.value) != -1}
    className="-striped -highlight"
    FilterComponent={FilterComponent}
    minRows={20}
    pageSizeOptions = {[20, 40, 60, 80, 100]}
  />
);

const onFocus = e => (e.target.placeholder = '');
const onBlur = e => (e.target.placeholder = 'filter');
const FilterComponent = ({ filter, onChange, column }) => (
  <input
    className="filter"
    type="text"
    style={{
      width: '95%',
    }}
    placeholder={column.Placeholder}
    placeholder="filter"
    onFocus={onFocus}
    onBlur={onBlur}
    value={filter ? filter.value : ''}
    onChange={event => onChange(event.target.value)}
  />
);

const DeleteButton = ({ deleteRow }) => (
  <div className="delete-button-container">
    <button
      className="delete-condition-button"
      title="Remove policy"
      data-comp="delete-condition"
      onClick={deleteRow}
    />
  </div>
);

const CellWithPositionKnowledge = compose(
  withProps(({ cellPosition, onEdit }) => ({
    onEdit: newData => onEdit(cellPosition, newData),
  })),
)(Cell);

export default compose(
  withHandlers({
    onEditCell: ({ data, onEditTable }) => ({ rowIndex, columnId }, cellNewData) => {
      if (cellNewData === data[rowIndex][columnId] && typeof cellNewData === 'string') {
        return;
      }

      const newData = [...data];
      newData[rowIndex] = { ...data[rowIndex], [columnId]: cellNewData };
      onEditTable(newData);
    },
  }),
  withHandlers({
    connectedCell: ({ onEditCell, data, columns }) => cellInfo => (
      <CellWithPositionKnowledge
        onEdit={onEditCell}
        cellPosition={{
          rowIndex: cellInfo.index,
          columnId: cellInfo.column.id,
        }}
        cellType={columns[cellInfo.column.id].type}
        data={data[cellInfo.index][cellInfo.column.id]}
        columnSpecificProps={columns[cellInfo.column.id].columnSpecificProps}
      />
    ),
    connectedDeleteButton: ({ onEditTable, data }) => cellInfo => (
      <DeleteButton
        deleteRow={() => {
          const rowIndex = cellInfo.index;
          const newData = data.filter((_, index) => index !== rowIndex);
          onEditTable(newData);
        }}
      />
    ),
  }),
  withProps(({ columns, connectedCell, connectedDeleteButton }) => ({
    columns: [
      {
        Header: '',
        id: 'delete-button',
        width: 30,
        Cell: connectedDeleteButton,
        Filter: () => null,
      },
      ...Object.keys(columns).map(name => ({
        Header: name,
        accessor: name,
        id: name,
        Cell: connectedCell,
      })),
    ],
  })),
)(EditableTable);
