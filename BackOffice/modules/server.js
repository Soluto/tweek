import React from 'react'
import { createServer } from 'react-project/server'
import { RouterContext } from 'react-router'
import Document from '../modules/components/Document'
import routes from '../modules/routes'
import configureStore from './store/configureStore'
import { Provider } from 'react-redux'
import serverRoutes from './serverRoutes'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

let repo = require('./repo/rulesRepo')
           .init({ url:'http://tweek-gogs.07965c2a.svc.dockerapp.io/tweek/tweek-rules', username:'tweek', password:'po09!@QW' })

function getApp(req, res, requestCallback) {
  
  requestCallback(null, {
    routes: routes(serverRoutes),
    render(routerProps, renderCallback) {
      let store = configureStore({})
      repo.getAllFiles().then(keys=> store.dispatch({ 'type':'KEYS_UPDATED', payload: keys }))
      .then(()=>
        renderCallback(null, {
          renderDocument: (props) => <Document {...props} initialState={store.getState()} />,
          renderApp: (props) => 
            <MuiThemeProvider muiTheme={getMuiTheme({ userAgent: req.headers['user-agent'] })}><Provider store={store}><RouterContext {...props} /></Provider></MuiThemeProvider>
        })
      )
    }
  })
}

createServer(getApp).start()

