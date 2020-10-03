import React, { useState } from 'react';

//mui
import { TextField, Typography, Select, MenuItem } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles( (theme) => ({
    root: {
        maxHeight: 150,
        padding: 30,
    },
    
    select: {
        margin: 20,
    }
}));

const DecisionDialog = (props) => {
    const classes = useStyles(); 

    const [type, setType] = useState(props.component ? props.component.branch : 'ONE');

    const handleChange = (e) => {
        setType(e.target.value);
        props.handleChange(e);
    }

    return (
        <div className={classes.root}>
            <TextField color='primary' onChange={props.handleChange} label="Condition" name="condition"
                placeholder="Enter Condition"  fullWidth defaultValue={props.component ? props.component.condition : ""}
            />

            <div className={classes.select}>
                <Typography variant='h6'>
                    Select Branch
                </Typography>
                <Select name='branch' fullWidth onChange={handleChange} value={type}>
                    <MenuItem value="ONE">
                        ONE
                    </MenuItem>
                    <MenuItem value="TWO">
                        TWO
                    </MenuItem>
                </Select>
            </div>
        </div>
    )
}

export default DecisionDialog;