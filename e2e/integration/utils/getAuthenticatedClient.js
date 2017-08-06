const supertest = require('supertest');
const getToken = require('./getToken');

const interceptAfter = (target, fn, methodNames)=>{
    let proxy = methodNames.reduce((acc, m)=>Object.assign(acc,{
        [m]: function(...args){
           return fn(target[m].call(target, ...args))
        }
    }),{});
    return proxy;
};

const restMethods = ["post", "get", "put", "delete", "patch", "head"]

module.exports = async function(privateKey, targetUrl){
    const token = await getToken(privateKey);
    return interceptAfter(supertest(targetUrl), (t)=>  t.set('Authorization', `Bearer ${token}`), ["request", ...restMethods]);
};