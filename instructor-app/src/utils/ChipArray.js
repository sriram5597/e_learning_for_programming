import React, { useState } from 'react'

//MUI
import { Chip } from '@material-ui/core';

const ChipArray = (props) => {
    const [state, setState] = useState({
        arr: props.data
    });

    const addData = (data) => (event) => {
        setState({
            arr: [...state.arr, data]
        });
    }   

    const removeData = (data) => (event) => {
        setState({
            arr: state.arr.filter( (ele) => ele != data)
        });
    }

    const chip = (state.arr.map((data, key) => {
                        let lab=`${props.prefix}${key}`;
                        return <Chip label={lab} color="primary" onDelete={removeData(data)} />
                    }
                )
            );

    return (
        <div>
            {chip}
        </div>
    )

}

export default ChipArray;