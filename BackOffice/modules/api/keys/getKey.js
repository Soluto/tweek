import promisify from "promisify-node";
var fs = promisify("fs");
import path from "path";

export default function (req, res, _, { params, location, route }) {
  var keyPath = params.splat;
  (async function(){
    return {
       ruleDef:{
         type: path.extname(keyPath).substring(1),
         source: (await fs.readFile(`./rulesRepo/rules/${keyPath}`)).toString()
       }
    }}
    )().then(res.json.bind(res), console.error.bind(console));
}