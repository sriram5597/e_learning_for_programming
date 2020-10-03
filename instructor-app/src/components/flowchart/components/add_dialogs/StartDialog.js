import React from 'react';

//mui
import { Checkbox, TextField } from '@material-ui/core';

const StartDialog = (props) => {
    return (
        <div>
            <TextField variant='outlined' color='primary' onChange={props.handleChange} label="Component Name" name="name"
                placeholder="Enter Component Name" helperText="Component Name helps you to find components" 
            />
        </div>
    )
}

export default StartDialog;