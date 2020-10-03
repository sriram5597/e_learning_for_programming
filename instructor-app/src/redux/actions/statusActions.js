export const setErrors = (type, name, message) => (dispatch) => {
    dispatch({
        type,
        payload: {
            name,
            status:'ERROR',
            message,
        }
    });
}

export const setLoading = (type, name) => (dispatch) => {
    dispatch({
        type,
        payload: {
            name,
            status: 'LOADING',
        }
    });
}

export const setFinish = (type, name) => (dispatch) => {
    dispatch({
        type,
        payload: {
            name,
            status: 'FINISHED',
        }
    });
}