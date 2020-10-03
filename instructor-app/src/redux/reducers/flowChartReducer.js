import { ADD_FLOW_COMPONENT, SET_POSITION, SET_SELECT, SET_SELECTED_COMPONENT, SET_UNSELECT, SET_COMPONENTS, SET_CREATED_COMPONENTS,
        SET_FLOWCHART_OUTPUT, SET_FLOWCHART_STATUS, SET_MOVE_COMPONENT, SET_CONNECTED_COMPONENTS, SET_CONNECT, SET_EXPORT_SRC,
} from '../types';

const initialState = {
    components: [],
    position: [],
    isSelect: false,
    selectedComponent: {},
    output: "",
    status: {},
    moveComponent: "",
    connectedComponents: {},
    createdComponents: {},
    isConnect: false,
    src: ""
}

export default function(state = initialState, action){
    switch(action.type){
        case ADD_FLOW_COMPONENT: 
            return {
                ...state,
                components: [...state.components, action.payload],
            }

        case SET_POSITION:
            return {
                ...state,
                position: {
                    ...state.position,
                    ...action.payload,
                },
            }

        case SET_SELECT:
            return {
                ...state,
                isSelect: true,
            }

        case SET_SELECTED_COMPONENT: 
            return {
                ...state,
                selectedComponent: action.payload,
            }

        case SET_COMPONENTS:
            return {
                ...state,
                components: action.payload,
            }
        
        case SET_UNSELECT: 
            return {
                ...state,
                isSelect: false,
            }

        case SET_FLOWCHART_OUTPUT:
            return {
                ...state,
                output: action.payload,
            }

        case SET_FLOWCHART_STATUS:
            return {
                ...state,
                status: action.payload,
            }

        case SET_MOVE_COMPONENT:
            return {
                ...state,
                moveComponent: action.payload,
            }

        case SET_CONNECTED_COMPONENTS:
            return {
                ...state,
                connectedComponents: action.payload.connectedComponents,
                components: action.payload.components,
            }

        case SET_CREATED_COMPONENTS:
            return {
                ...state,
                createdComponents: action.payload,
            }

        case SET_CONNECT:
            return {
                ...state,
                isConnect: action.payload
            }

        case SET_EXPORT_SRC:
            return {
                ...state,
                src: action.payload
            }

        default:
            return state;
    }
}