import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            request: '',
        };
    }

    onClick = () => {
        fetch('/api').then(result => result.text()).then(request => this.setState({ request }));
    };

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
          <button onClick={this.onClick}>Click ME!</button>
          <p>{this.state.request}</p>
      </div>
    );
  }
}

export default App;
