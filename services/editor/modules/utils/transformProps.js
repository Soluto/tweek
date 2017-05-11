export default projection => (objectToTransform) => {
  if (objectToTransform == null) {
    return objectToTransform;
  }

  return Object.keys(objectToTransform).reduce((result, key) => ({
    ...result,
    [projection(key)]: objectToTransform[key],
  }), {});
};
