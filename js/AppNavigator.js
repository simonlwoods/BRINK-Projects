import { StackNavigator } from "react-navigation";

import Home, { SetupOrHome } from "./components/home";
import Settings from "./components/settings";
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
