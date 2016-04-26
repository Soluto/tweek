import React from "react";
import { Link } from 'react-router'
var leaf = Symbol();
var getName = (path)=> path.split("/").slice(-1)[0]

function renderTree(tree, currentPath)
{
    return tree[leaf] ? 
               (<Link to={`/keys${currentPath}`}>{getName(currentPath)}</Link>)
               : (<div>{getName(currentPath)}<ul>
               {Object.keys(tree)
                .map( key=> (<li>
                    {renderTree(tree[key], `${currentPath}/${key}`)}
                    </li>)
                )}</ul></div>);
}


export default ({keys})=>{
    var tree = {};
    keys.map(x=>x.split("/"))
         .forEach(fragments =>
             fragments.reduce((node, frag)=> node[frag] = node[frag] || {}, tree)[leaf] = true
         );  
    return renderTree(tree, "");
}