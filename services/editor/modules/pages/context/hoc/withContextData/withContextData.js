import { Observable } from 'rxjs/Rx';
import { mapPropsStream } from 'recompose';

const enhance = () => mapPropsStream(propsStream => {
  return propsStream.combineLatest(createContextDataStream(propsStream), (props, contextData) => ({
    ...props,
    contextData
  }))
})

const createContextDataStream = propsStream => 
  propsStream.flatMap(async props => await getContextData(props));

const getContextData = async ({ contextType, contextId }) => {
  let response = await fetch(`/api/context/${contextType}/${contextId}`, { credentials: 'same-origin' });
  return await response.json()
}

export default enhance;