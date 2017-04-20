
const initialState = [];

export default function (state = initialState, action) {
  switch (action.type) {
    case 'HUE_AUTHENTICATE_SUCCESS': 
      return [...state, action.brigdge];
    case 'HUE_AUTHENTICATE_FAILURE':
      return state.filter(bridge => bridge.id !== action.bridge.id);
    default:
      return state;
  }
}
