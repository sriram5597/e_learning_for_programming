import React from 'react';

//mui
import { TextField } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    root: {
        maxHeight: 150,
        padding: 30,
    },
}));

const PrintDialog = (props) => {
    const classes = useStyles();
    
    return (
        <div className={classes.root}>
            <TextField color='primary' onChange={props.handleChange} label="Text" name="print" defaultValue={props.component ? props.component.print : null}
                placeholder="Enter Text"  helperText="If you are printing a text, Enclose with double quotes. Else, Enter variable name without any quotes"
                variant='outlined' fullWidth
            />
        </div>
    )
}

export default PrintDialog;