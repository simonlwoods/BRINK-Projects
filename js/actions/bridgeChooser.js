
import type { Action } from './types';

export const ADD_USER = 'ADD_USER';
export const REMOVE_USER = 'REMOVE_USER';
export const SELECT_BRIDGE = 'SELECT_BRIDGE';
export const ADD_BRIDGE = 'ADD_BRIDGE';
export const CLEAR_BRIDGES = 'CLEAR_BRIDGES';

export function addUser(bridgeId, username):Action {
  return {
    type: ADD_USER,
    bridgeId,
    username,
  };
}

export function removeUser(bridgeId):Action {
  return {
    type: REMOVE_USER,
    bridgeId,
  };
}

export function selectBridge(bridgeId):Action {
  return {
    type: SELECT_BRIDGE,
    payload: bridgeId,
  };
}

export function addBridge(bridge):Action {
  return {
    type: ADD_BRIDGE,
    payload: bridge,
  };
}

export function clearBridges():Action {
  return {
    type: CLEAR_BRIDGES,
  };
}
