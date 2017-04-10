
import React, { Component } from 'react';
import { addNavigationHelpers } from 'react-navigation';
import { AsyncStorage, BackAndroid } from 'react-native';
import { combineReducers, createStore, applyMiddleware, compose } from 'redux';
import { connect, Provider } from 'react-redux';

import devTools from 'remote-redux-devtools';
import thunk from 'redux-thunk';
import { persistStore, autoRehydrate } from 'redux-persist';

import { ThemeProvider } from 'styled-components';

import bridgeChooser from './reducers/bridgeChooser';

import promise from './promise';
import AppNavigator from './AppNavigator';
import SplashScreen from './components/SplashScreen';
import baseTheme from './themes/base-theme.js';

const navReducer = (state, action) => {
  const newState = AppNavigator.router.getStateForAction(action, state);
  return newState || state;
};

const appReducer = combineReducers({
  bridges: bridgeChooser,
  navigation: navReducer,
});

const AppWithNavigationState = connect(state => ({
  navigation: state.navigation,
}))((props) => (
  <AppNavigator navigation={addNavigationHelpers({
    dispatch: props.dispatch,
    state: props.navigation,
  })} />
));


const enhancer = compose(
  applyMiddleware(thunk, promise),
  devTools({
    name: 'nativestarterkit', realtime: true,
  }),
  autoRehydrate(),
);

const store = createStore(appReducer, enhancer);

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
    persistStore(store, { storage: AsyncStorage }, () => {
      this.setState({
        loading: false,
      });
    });
  }
  render() {
    return (
        <Provider store={store}>
          <ThemeProvider theme={baseTheme}>
            <SplashScreen loading={this.state.loading}>
              <AppWithNavigationState />
            </SplashScreen>
          </ThemeProvider>
        </Provider>
    );
  }
}

export default App;
