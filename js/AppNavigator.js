import { StackNavigator } from "react-navigation";

import Setup from "./components/Setup";

const AppNavigator = StackNavigator({
	Home: {
		screen: Setup
	},
	DrawerClose: {
		screen: Setup
	}
});

export default AppNavigator;
