
import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';

import App from './App';
import configureStore from './configureStore';
import baseTheme from './themes/base-theme.js';

function setup():React.Component {
  class Root extends Component {

    constructor() {
      super();
      this.state = {
        isLoading: false,
        store: configureStore(() => this.setState({ isLoading: false })),
      };
    }

    render() {
      return (
        <Provider store={this.state.store}>
          <ThemeProvider theme={baseTheme}>
            <App />
          </ThemeProvider>
        </Provider>
      );
    }
  }

  return Root;
}

export default setup;
