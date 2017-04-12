export default ({ initialConfiguration, newConfiguration }) => {

  if (initialConfiguration === undefined){
    return Object.keys(newConfiguration).reduce((result, key) => ({
      ...result,
      [key]: {
        initialValue: undefined,
        newValue: newConfiguration[key],
        isAdded: false,
        isRemoved: false,
        isUpdated: false
      }
    }), {})
  }

  const allKeys = [].concat(
      Object.keys(initialConfiguration),
      Object.keys(newConfiguration).filter(key => !initialConfiguration.hasOwnProperty(key))
    )

  const diff = allKeys.reduce((result, key) => {

    const initialValue = initialConfiguration[key];
    const isInInitial = initialConfiguration.hasOwnProperty(key);
    
    const isInNew = newConfiguration.hasOwnProperty(key);
    const newValue = newConfiguration[key];
    
    result[key] = {
      initialValue,
      newValue,
      isAdded: isInNew && !isInInitial,
      isRemoved: !isInNew && isInInitial,
      isUpdated: isInNew && isInInitial && initialValue !== newValue
    }

    return result;
  }, {})

  return diff;
}