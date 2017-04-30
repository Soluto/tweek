// probably Rambda has a better way of doing it, need to check...

export default propPredicate => objectToFilter => {
  if (objectToFilter == undefined || objectToFilter == null){
    return objectToFilter;
  }

  return Object.keys(objectToFilter)
    .filter(propPredicate)
    .reduce((result, key) => ({
      ...result,
      [key]: objectToFilter[key]
    }), {})
}