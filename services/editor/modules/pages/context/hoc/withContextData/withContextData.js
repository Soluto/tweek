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
  return {
    "someContextProperty": "some-hardcoded-context-value",
    "@fixed:example": "some-fixed-example-hardcoded-value"
  }
}

export default enhance;