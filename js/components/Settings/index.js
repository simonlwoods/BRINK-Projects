import React, { Component } from "react";
import { FlatList } from "react-native";
import { connect } from "react-redux";
import { StackNavigator } from "react-navigation";

import { settingsPurge } from "./../../actions/settings";

import CheckBox from "react-native-checkbox";

import Text from "./../Text";

import theme from "./../../themes/base-theme";

class BaseSettings extends Component {
	render() {
		return <Text>Test</Text>;
		<FlatList
			data={[
				{
					text: "Delete data on startup"
				}
			]}
			renderItem={item => <Text>{item.text}</Text>}
		/>;
	}
}
const mapDispatchToProps = {
	settingsPurge
};

const mapStateToProps = state => ({
	settings: state.settings
});

const Settings = connect(mapStateToProps, mapDispatchToProps)(BaseSettings);

export default StackNavigator(
	{
		Base: { screen: Settings }
	},
	{
		headerMode: "none",
		cardStyle: {
			backgroundColor: theme.bgColor
		}
	}
);
