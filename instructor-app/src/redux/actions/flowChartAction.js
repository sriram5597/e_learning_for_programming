import { setErrors, setFinish, setLoading } from './statusActions';

import { ADD_FLOW_COMPONENT, SET_POSITION, SET_SELECTED_COMPONENT, SET_COMPONENTS, SET_FLOWCHART_OUTPUT, SET_FLOWCHART_STATUS,
         SET_MOVE_COMPONENT, SET_CONNECTED_COMPONENTS, SET_CREATED_COMPONENTS, SET_CONNECT, SET_EXPORT_SRC,
} from '../types';

export const addComponent = (comp) => (dispatch) => {
    dispatch({
        type: ADD_FLOW_COMPONENT,
        payload: comp,
    });
}

export const setPosition = (pos) => (dispatch) => {
    dispatch({
        type: SET_POSITION,
        payload: pos,
    });
}

export const selectComponent = (comp) => (dispatch) => {
    dispatch({
        type: SET_SELECTED_COMPONENT,
        payload: comp,
    });
}

export const updateComponents = (comps) => (dispatch) => {
    dispatch({
        type: SET_COMPONENTS,
        payload: comps,
    });
}

// export const executeFlowchart = (data) => async (dispatch) => {
//     dispatch(setLoading(SET_FLOWCHART_STATUS, 'executeFlowchart'));

//     try{
//         //const res = await axios.post('/api/flowchart/execute/', data);

//         console.log(res.data);

//         dispatch({
//             type: SET_FLOWCHART_OUTPUT,
//             payload: res.data.output.result,
//         });

//         dispatch(setFinish(SET_FLOWCHART_STATUS, 'executeFlowchart'));
//     }
//     catch(err){
//         dispatch(setErrors(SET_FLOWCHART_STATUS, 'executeFlowchart', err.response.data.error));
//         console.log(err.response.data);
//     }
// }

export const moveComponent = (comp) => (dispatch) => {
    dispatch({
        type: SET_MOVE_COMPONENT,
        payload: comp,
    });
}

export const updatePosition = (pos) => (dispatch) => {
    dispatch({
        type: SET_POSITION,
        payload: pos,
    });
}

export const setConnectedComponents = (comp) => (dispatch) => {
    dispatch({
        type: SET_CONNECTED_COMPONENTS,
        payload: comp,
    });
}

export const createComponent = (comp) => (dispatch) => {
    dispatch({
        type: SET_CREATED_COMPONENTS,
        payload: comp,
    });
}

export const setConnect = (flag) => (dispatch) => {
    dispatch({
        type: SET_CONNECT,
        payload: flag,
    });
}

export const exportSrc = (src) => (dispatch) => {
    dispatch({
        type: SET_EXPORT_SRC,
        src
    });
}

export const connectComponent = (source, dest, position, components) => (dispatch) => {
    const index = source.index;
    const destIndex = dest.index;

    const descisionRange = parseFloat(position[source.name].x) + parseFloat(position[source.name].width) / 2;
    const compPos = parseFloat(position[dest.name].x) + parseFloat(position[dest.name].width);

    if(index === destIndex){
        return;
    }

    if(source.type === 'DECISION'){
        if(source.branch === 'TWO'){
            if(descisionRange > compPos){
                source.connectedTo = {
                    ...source.connectedTo,
                    trueBlock: dest.index
                }
            }
            else{
                source.connectedTo = {
                    ...source.connectedTo,
                    falseBlock: dest.index
                }
            }
        }
        else{
            if(descisionRange > compPos){
                source.connectedTo = {
                    ...source.connectedTo,
                    trueBlock: dest.index
                }
            }
            else{
                source.connectedTo = {
                    ...source.connectedTo,
                    outerBlock: dest.index
                }
            }
        }
        components[source.index] = source;
    }
    else{
        components[index].connectedTo = destIndex;
    }

    dispatch(updateComponents(components));
    dispatch({
        type: SET_CONNECT,
        payload: false
    });
}

// export const saveChart = (data) => async (dispatch) => {
//     dispatch(setLoading(SET_FLOWCHART_STATUS, 'saveChart'));
    
//     try{
//         await axios.post('/api/flowchart/save-chart/', data);
//         dispatch(setFinish(SET_FLOWCHART_STATUS, 'saveChart'));
//     }
//     catch(err){
//         console.log(err.response.data);
//         dispatch(setErrors(SET_FLOWCHART_STATUS, 'saveChart', err.response.data));
//     }
// }

// export const loadChart = (id) => async (dispatch) => {
//     dispatch(setLoading(SET_FLOWCHART_STATUS, 'loadChart'));
    
//     try{
//         const res = await axios.get(`/api/flowchart/load-chart/?problem_id=${id}`);
        
//         dispatch({
//             type: SET_EXPORT_SRC,
//             payload: res.data.url
//         });

//         dispatch(setFinish(SET_FLOWCHART_STATUS, 'loadChart'));
//     }
//     catch(err){
//         console.log(err.response.data);
//         dispatch(setErrors(SET_FLOWCHART_STATUS, 'loadChart', err.response.data));
//     }
// }