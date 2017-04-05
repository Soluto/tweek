export default projection => objectToTransform => Object.keys(objectToTransform).reduce((result, key) => ({
  ...result,
  [projection(key)]: objectToTransform[key]
}), {})