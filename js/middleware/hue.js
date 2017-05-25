const huejay = require("huejay");
const co = require("co");

function getClient(bridge) {
	return new huejay.Client({
		host: bridge.ip,
		username: bridge.username
	});
}

function* findBridges() {
	for (let i = 0; i < 10; i++) {
		const bridges = yield huejay.discover();
		for (const bridge of bridges) {
			const client = new huejay.Client({ host: bridge.ip });
			let user = new client.users.User(); // eslint-disable-line
			user.deviceType = "polarapp";
			try {
				user = yield client.users.create(user);
			} catch (error) {
				console.log(`${bridge.ip} rejected pair`);
			}
			if (user.username) {
				return { ...bridge, username: user.username };
			}
		}
	}
	return yield Promise.reject("No bridges found");
}

const authenticate = state =>
	function*() {
		const client = getClient(state.bridges.current);
		yield client.bridge.ping();
		return yield client.bridge.isAuthenticated();
	};

const scanLights = state =>
	function*() {
		const client = getClient(state.bridges.current);
		return yield client.lights.scan();
	};

const getLights = state =>
	function*() {
		const client = getClient(state.bridges.current);
		return yield client.lights.getAll();
	};

const setLights = (state, color) =>
	function*() {
		const client = getClient(state.bridges.current);
		const lights = state.bridges.current.lights;
		for (light of lights) {
			if (light.appState.selected && light.reachable) {
				light.brightness = Math.floor(color.Y / 65 * 200);
				light.xy = color.xy;
				light.transitionTime = 0.1;
				yield client.lights.save(light);
			}
		}
		return yield client.lights.getAll();
	};

function makeQueue(next) {
	let queue = Promise.resolve();
	return (action, generator) => {
		queue = queue.then(() =>
			next({
				...action,
				types: [
					`${action.type}_REQUEST`,
					`${action.type}_SUCCESS`,
					`${action.type}_FAILURE`
				],
				promise: () =>
					co(generator).catch(error => {
						if (typeof error === "huejay.Error") {
							console.log(error);
							return next({
								type: "HUE_ERROR",
								id: error.type,
								message: error.message,
								action
							});
						}
						return new Promise.reject(error);
					})
			})
		);
		return queue;
	};
}

export default store => next => {
	const addToQueue = makeQueue(next);
	return action => {
		const state = store.getState();
		switch (action.type) {
			case "HUE_FIND_BRIDGE":
				return addToQueue(action, findBridges);
			case "HUE_AUTHENTICATE":
				return addToQueue(action, authenticate(state));
			case "HUE_SCAN_LIGHTS":
				return addToQueue(action, scanLights(state));
			case "HUE_GET_LIGHTS":
				return addToQueue(action, getLights(state));
			case "HUE_SET_LIGHTS":
				return addToQueue(action, setLights(state, action.color));
			default:
				return next(action);
		}
	};
};
