import React from "react";
import styled from "styled-components/native";

import { Button, Text, View } from "./../../components";

const PairingText = styled(Text)`
  text-align: center;
  margin-bottom: 15;
`;

const PairingButton = styled(Button)`
  align-self: center;
`;

const Pairing = props => (
	<View>
		<PairingText>
			To pair with this bridge, press the Link button on the bridge then tap "Pair".
		</PairingText>
		<PairingButton onPress={props.onPress}>Pair</PairingButton>
	</View>
);

Pairing.propTypes = {
	onPress: React.PropTypes.func
};

export default Pairing;
