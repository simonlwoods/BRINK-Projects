const huejay = require("huejay");
const moment = require("moment");
const co = require("co");

import { bisector } from "d3-array";

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
		const group = yield client.groups.getById(0);
		group.brightness = Math.floor(color.Y / 65 * 200);
		group.xy = color.xy;
		group.transitionTime = 0.1;
		yield client.groups.save(group);
		return yield client.lights.getAll();
	};

const setSchedule = (store, next, start, rebase, period) =>
	function*() {
		start = moment(start);

		let duration;
		switch (period) {
			case "daily":
				duration = moment.duration(15, "minutes");
				break;
			case "weekly":
			default:
				duration = moment.duration(101, "minutes");
				break;
		}

		let state = store.getState();

		const client = getClient(state.bridges.current);
		const schedules = yield client.schedules.getAll();

		for (let schedule of schedules) {
			yield client.schedules.delete(schedule.id);
		}

		const group = yield client.groups.getById(0);
		const diff = rebase.diff(start);

		let time;
		let rebasedTime;
		for ((time = moment(start)), (i = 0); i < 100; time.add(duration)) {
			const key = time.format("YYYY-MM-DD");

			if (!state.data[key]) {
				yield next({
					type: "DATA_LOAD",
					date: time
				});
				state = store.getState();
			}

			const data = state.data[key];
			const idx = bisector((d, x) =>
				moment(d.timestamp).diff(moment(x), "minutes")
			).left(data, time);
			const dataPoint = data[idx < data.length ? idx : data.length - 1];

			group.brightness = Math.floor(dataPoint.Y / 65 * 200);
			if (!group.on && group.brightness == 0) {
				continue;
			}
			group.on = group.brightness != 0;
			group.xy = [dataPoint.x, dataPoint.y];
			//group.transitionTime = duration.asSeconds();
			group.transitionTime = 1;

			//const rebasedTime = moment(time).add(diff, "milliseconds");
			rebasedTime = moment(rebase).add(i * 2, "seconds");

			const schedule = new client.schedules.Schedule();
			schedule.name = "PolarApp schedule " + i;
			schedule.description = "None";
			schedule.localTime = new client.timePatterns.AbsoluteTime(
				rebasedTime.format("YYYY-MM-DD HH:mm:ss")
			);
			schedule.action = new client.actions.ChangeGroupAction(group);
			schedule.autoDelete = true;

			yield client.schedules
				.create(schedule)
				.catch(error => console.log(error));
			i++;
		}
		console.log("Data time ", time.format("YYYY-MM-DD HH:mm:ss"));
		console.log("Schedule time ", rebasedTime.format("YYYY-MM-DD HH:mm:ss"));
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
			case "HUE_SET_SCHEDULE":
				return addToQueue(
					action,
					setSchedule(store, next, action.start, action.rebase, action.period)
				);
			default:
				return next(action);
		}
	};
};
