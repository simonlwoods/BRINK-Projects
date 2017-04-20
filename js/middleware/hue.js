
const huejay = require('huejay');
const co = require('co');

function *findBridges() {
  for (let i = 0; i < 10; i++) {
    const bridges = yield huejay.discover();
    for (const bridge of bridges) {
      const client = new huejay.Client({ host: bridge.ip });
      let user = new client.users.User; // eslint-disable-line
      user.deviceType = 'polarapp';
      try { user = yield client.users.create(user); } 
      catch (error) { console.log(`${ bridge.ip } rejected pair`); }
      if (user.username) {
        return { ...bridge, username: user.username };
      }
    }
  }
  return yield Promise.reject("No bridges found");
}

function *authenticateBridge(bridge) {
  const client = new huejay.Client({ 
    host: bridge.ip,
    username: bridge.username
  }); 
  yield client.bridge.ping();
  return yield client.bridge.isAuthenticated();
}

function makeQueue(next) {
  const queue = Promise.resolve();
  return (action, generator) => queue.then(() => next({
    ...action,
    types: [
      `${action.type}_REQUEST`,
      `${action.type}_SUCCESS`,
      `${action.type}_FAILURE`
    ],
    promise: () => co(generator).catch(error => {
      if (typeof error === 'huejay.Error') {
        console.log(error);
        /*
          return next({
            type: 'HUE_ERROR',
            id: error.type,
            message: error.message,
            action,
          });
        */
      }
      return new Promise.reject(error);
    })
  }));
}

export default store => next => {
  const addToQueue = makeQueue(next);
  return action => {
    switch (action.type) {
      case 'HUE_FIND_BRIDGE':
        return addToQueue(action, findBridges);
      case 'HUE_AUTHENTICATE':
        return addToQueue(action, authenticateBridge(action.bridge));
      default:
        return next(action);
    }
  }
}
