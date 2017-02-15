export async function getTypes(req, res, { tweekApiHostname }) {
  let response = await fetch(`${tweekApiHostname}/configurations/@tweek/custom_types/_?$ignoreKeyTypes=false`);
  let customTypes = await response.json();

  res.json(customTypes);
}
