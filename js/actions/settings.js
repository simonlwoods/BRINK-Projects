export function settingsChange(setting, value) {
	return {
		type: "SETTINGS_CHANGE",
		setting,
		value
	};
}
