import React, { Component } from "react";
import { ListView, View } from "react-native";
import styled from "styled-components/native";
import { connect } from "react-redux";
import { StackNavigator } from "react-navigation";

import { settingsChange } from "./../../actions/settings";

import CheckBox from "./../CheckBox";
import StateDisplay from "./../StateDisplay";

import { Header, Text } from "./../../components";

import theme from "./../../themes/base-theme";

class BaseSettings extends Component {
	constructor(props) {
		super(props);
		const ds = new ListView.DataSource({
			rowHasChanged: (r1, r2) => r1.name !== r2.name || r1.value !== r2.value
		});

		const rows = this._settingsToRows(props.settings);
		this.state = {
			dataSource: ds.cloneWithRows(rows)
		};
	}

	_settingsToRows(settings) {
		const rows = [];
		for (let setting of Object.keys(settings)) {
			rows.push(Object.assign({ name: setting }, settings[setting]));
		}
		return rows;
	}

	componentWillReceiveProps(nextProps) {
		const rows = this._settingsToRows(nextProps.settings);
		this.setState({
			dataSource: this.state.dataSource.cloneWithRows(rows)
		});
	}

	render() {
		return (
			<View>
				<Header style={{ paddingTop: 20, paddingBottom: 20 }}>
					<Text>Swipe down to return</Text>
				</Header>
				<ListView
					dataSource={this.state.dataSource}
					renderRow={rowData => (
						<View style={{ padding: 20, paddingBottom: 0 }}>
							{rowData.type == "boolean" ? <CheckBox {...rowData} /> : null}
							{rowData.type == "state" ? <StateDisplay {...rowData} /> : null}
						</View>
					)}
				/>
			</View>
		);
	}
}

const mapDispatchToProps = {
	settingsChange
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
