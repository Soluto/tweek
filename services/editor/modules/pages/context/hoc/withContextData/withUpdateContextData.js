import { withProps } from 'recompose';

const enhance = input => withProps(props => ({
  updateContext: async contextData => {
    fetch(`/api/context/${props.contextType}/${props.contextId}`, {
      credentials: 'same-origin',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contextData) })
  }
}))

export default enhance;