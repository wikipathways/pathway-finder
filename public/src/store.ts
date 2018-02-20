import { createStore, applyMiddleware } from 'redux';
import { createEpicMiddleware } from 'redux-observable';

const PING = 'PING';
const PONG = 'PONG';

const pingEpic = action$ =>
  action$.ofType(PING)
    .delay(1000) // Asynchronously wait 1000ms then continue
    .mapTo({ type: PONG });

const pingReducer = (state = { isPinging: false }, action) => {
  switch (action.type) {
    case PING:
      return { isPinging: true };

    case PONG:
      return { isPinging: false };

    default:
      return state;
  }
};

const epicMiddleware = createEpicMiddleware(pingEpic);

export const store = createStore(pingReducer,
  applyMiddleware(epicMiddleware)
);
