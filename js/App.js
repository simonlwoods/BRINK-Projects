import Expo from "expo";

import React, { Component } from "react";
import { addNavigationHelpers } from "react-navigation";
import { AsyncStorage, BackAndroid, Dimensions, StatusBar } from "react-native";
import { combineReducers, createStore, applyMiddleware, compose } from "redux";
import { connect, Provider } from "react-redux";

import { persistStore, autoRehydrate } from "redux-persist";

import { ThemeProvider } from "styled-components";

import settingsManager from "./reducers/settings";
import bridgeManager from "./reducers/bridgeManager";
import dataManager from "./reducers/data";
import graphManager from "./reducers/graph";

import promiseMiddleware from "./middleware/promise";
import hueMiddleware from "./middleware/hue";
import dataMiddleware from "./middleware/data";
import graphMiddleware from "./middleware/graph";

import AppNavigator from "./AppNavigator";
import SplashScreen from "./components/SplashScreen";
import Settings from "./components/Settings";
import baseTheme from "./themes/base-theme.js";

import { loadDataMonth, loadDataYear } from "./actions/data";
import { setParams } from "./actions/graph";

const moment = require("moment");
const co = require("co");

const navReducer = (state, action) => {
	const newState = AppNavigator.router.getStateForAction(action, state);
	return newState || state;
};

const appReducer = combineReducers({
	settings: settingsManager,
	bridges: bridgeManager,
	data: dataManager,
	graph: graphManager,
	navigation: navReducer
});

const AppWithNavigationState = connect(state => ({
	navigation: state.navigation
}))(props => (
	<AppNavigator
		navigation={addNavigationHelpers({
			dispatch: props.dispatch,
			state: props.navigation
		})}
	/>
));

const enhancer = compose(
	applyMiddleware(
		hueMiddleware,
		dataMiddleware,
		graphMiddleware,
		promiseMiddleware
	),
	autoRehydrate()
);

const store = createStore(appReducer, enhancer);

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true
		};

		console.log("STATE LOADING");
		persistStore(store, { storage: AsyncStorage, whitelist: ["none"] }, () => {
			console.log("STATE LOADED");
			const bridge = store.getState().bridges.current;

			if (bridge.id) {
				store.dispatch({
					type: "HUE_AUTHENTICATE",
					bridge: store.getState().bridges.current
				});
				store.dispatch({
					type: "HUE_GET_LIGHTS",
					bridge: store.getState().bridges.current
				});
			}

			const { width } = Dimensions.get("window");
			store.dispatch(setParams(width, 225, 3));

			co(function*() {
				for (let i = 0; i < 12; i++) {
					yield store.dispatch(loadDataMonth(i));
				}
				yield store.dispatch(loadDataYear());
			}).then(() => {
				this.setState({
					loading: false
				});
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
