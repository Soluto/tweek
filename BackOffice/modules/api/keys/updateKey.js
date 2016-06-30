import promisify from 'promisify-node'
let fs = promisify('fs')
import path from 'path'

export default function (req, res, _, { params, location, route }) {
  let keyPath = params.splat
  console.log(req.body)
  
  res.send(req.body)
}
