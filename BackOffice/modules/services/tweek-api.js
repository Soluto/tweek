const tweekApiHostname = env.TWEEK_API_HOSTNAME;

export async function GetSchema(){
  let response = await fetch(`${tweekApiHostname}/configurations/@tweek/context/_?$ignoreKeyTypes=false`);
  return await response.json();
}