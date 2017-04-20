
import Expo from 'expo';

import React, { Component } from 'react';
import { addNavigationHelpers } from 'react-navigation';
import { AsyncStorage, BackAndroid, StatusBar } from 'react-native';
import { combineReducers, createStore, applyMiddleware, compose } from 'redux';
import { connect, Provider } from 'react-redux';

import { persistStore, autoRehydrate } from 'redux-persist';

import { ThemeProvider } from 'styled-components';

import bridgeManager from './reducers/bridgeManager';

import promiseMiddleware from './middleware/promise';
import hueMiddleware from './middleware/hue';

import AppNavigator from './AppNavigator';
import SplashScreen from './components/SplashScreen';
import baseTheme from './themes/base-theme.js';

const navReducer = (state, action) => {
  const newState = AppNavigator.router.getStateForAction(action, state);
  return newState || state;
};

const appReducer = combineReducers({
  bridges: bridgeManager,
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
  applyMiddleware(hueMiddleware, promiseMiddleware),
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
      console.log(store.getState());
      const bridge = store.getState().bridges.current;
      
      if (bridge.id) store.dispatch({ 
        type: 'HUE_AUTHENTICATE',
        bridge: store.getState().bridges.current,
      });
      
      setTimeout(() => {
        this.setState({
          loading: false,
        });
      }, 500);
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
