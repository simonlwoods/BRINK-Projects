
import type { Action } from './types';

const huejay = require('huejay');
const co = require('co');

export function findBridge() {
  return {
    type: 'HUE_FIND_BRIDGE',
  }
}

export function authenticate(bridge) {
  return {
    type: 'HUE_AUTHENTICATE',
    bridge,
  }
}
