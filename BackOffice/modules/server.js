import React from 'react'
import { createServer } from 'react-project/server'
import { RouterContext } from 'react-router'
import Document from '../modules/components/Document'
import routes from '../modules/routes'
import configureStore from './store/configureStore'
import {Provider} from 'react-redux'
import serverRoutes from './serverRoutes'

var repo = require("./repo/rulesRepo")
           .init({url:"http://tweek-gogs.07965c2a.svc.dockerapp.io/tweek/tweek-rules", username:"tweek", password:"***REMOVED***"});


function getApp(req, res, requestCallback) {
  // here is your chance to do things like get an auth token and generate
  // your route config w/ request aware `onEnter` hooks, etc.
  
  requestCallback(null, {
    routes: routes(serverRoutes),
    render(routerProps, renderCallback) {
      
      var store = configureStore({});
      repo.getAllFiles().then(keys=> store.dispatch({"type":"KEYS_UPDATED", payload: keys}))
      .then(()=>
      
      // here is your chance to load up data before rendering and pass it to
      // your top-level components
        renderCallback(null, {
          renderDocument: (props) => <Document {...props} initialState={store.getState()} />,
          renderApp: (props) => <Provider store={store}><RouterContext {...props} /></Provider>
        })
      );
    }
  })
}

createServer(getApp).start()

