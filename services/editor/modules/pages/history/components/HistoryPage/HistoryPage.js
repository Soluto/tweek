import React from 'react';
import { Component } from 'react';
import style from './HistoryPage.css';
import * as actions from '../../../../store/ducks/history';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import withLoading from '../../../../hoc/with-loading';
import { refreshTypes } from '../../../../services/types-service';
import { refreshSchema } from "../../../../services/context-service";
import { Table } from 'reactable';

const isNode=new Function("try {return this===global;}catch(e){return false;}");

export default compose(
  connect(state => state, { ...actions }),
  withLoading(() => null, isNode() ? Promise.resolve() : refreshTypes()),
  withLoading(() => null, isNode() ? Promise.resolve() : refreshSchema())
)
(class HistoryPage extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if (!this.props.history) {
      this.props.getHistory([]);
    }
  }

  render() {
    const { history } = this.props;
    return (
      <div className={style['history-list']}>
        <Table className="table" data={history} />
      </div>
    );
  }
});