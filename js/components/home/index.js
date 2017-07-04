import React, { Component } from "react";
import { connect } from "react-redux";
import styled from "styled-components/native";

import {
	Button,
	Container,
	Header,
	Footer,
	Content,
	Text,
	CircledIcon
} from "./../../components";

const huejay = require("huejay");

class Home extends Component {
	constructor(props) {
		super(props);

		this.state = {
			on: false
		};
		this.client = new huejay.Client({
			host: props.bridge.ip,
			username: props.bridge.username
		});
		this.client.lights.getAll().then(
			lights => {
				for (let l of lights) {
					l.on = false;
					this.client.lights.save(l);
				}
			},
			() => {}
		);
	}

	huejayOn() {
		this.client.lights.getAll().then(
			lights => {
				for (let l of lights) {
					l.on = true;
					this.client.lights.save(l);
				}
			},
			() => {}
		);
		this.setState({ on: true });
	}

	render() {
		return (
			<Container>
				<Content>
					<Text>Ready to be transported to a far away land?</Text>
					<Button
						style={{ width: 100 }}
						onPress={() => (this.huejayOn(), this.props.navigateNext())}
					>
						{"ON"}
					</Button>
				</Content>
			</Container>
		);
	}
}

Home.propTypes = {
	navigateNext: React.PropTypes.func
};

const mapDispatchToProps = {};

const mapStateToProps = state => ({
	bridge: state.bridges.current
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);
