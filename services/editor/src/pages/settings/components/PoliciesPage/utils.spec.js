/* global jest, beforeEach, describe, it, afterEach, expect Promise process */

import { testHook } from 'react-testing-library';
import { useRemoteState } from "./utils.ts";

describe("useRemoteState", ()=>{
    
  it("should load data", async ()=>{

    /*
    let data, setData, remoteData;

    
    testHook(()=> {
      [data, setData, remoteData] = useRemoteState(jest.fn(()=> Promise.resolve({ test: "abc" })) , 
        data=> Promise.resolve() );
    });

    expect(jest.fn()).toHaveBeenCalledTimes(1);

    expect(data).toEqual({ "test": "abc" });

    expect(true).toEqual(true);
    */
  });
});