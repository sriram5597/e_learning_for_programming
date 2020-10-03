import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

//reducers
import authenticationReducer from './reducers/authenticationReducer';
import flowChartReducer from './reducers/flowChartReducer';

const initialState = {};

const middleware = [thunk];

const reducers = combineReducers({
    auth: authenticationReducer,
    flowChart: flowChartReducer,
});

const store = createStore(reducers, initialState, compose(
    applyMiddleware(...middleware),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
));

export default store;