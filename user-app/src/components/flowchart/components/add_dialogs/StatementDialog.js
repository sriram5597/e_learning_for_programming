import React from 'react';

//mui
import { TextField, Typography } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    root: {
        padding: 20,
        maxHeight: 150,
        overFlowY: 'scroll',
    },
}));

const StatementDialog = (props) => {
    const classes = useStyles();

    const { component } = props;

    return (
        <div className={classes.root}>
            <Typography variant='subtitle1'>
                Enter Statement
            </Typography>
            
            <TextField variant='outlined' defaultValue={component ? component.statement : null} color='primary' onChange={props.handleChange} 
                label="Statement" name="statement" placeholder="Enter Statement"  fullWidth
            />
        </div>
    )
}

export default StatementDialog;