async function downloadKey(key){
  var {ruleDef} = await (await fetch(`/api/keys/${key}`)).json();
  return {"type": "KEY_DOWNLOADED", "payload":
    {
      key,
      meta: {},
      ruleDef
    }};
}

export default (key)=>(dispatch)=>{
  dispatch({"type": "SELECT_KEY"})
  dispatch(downloadKey(key));
}
