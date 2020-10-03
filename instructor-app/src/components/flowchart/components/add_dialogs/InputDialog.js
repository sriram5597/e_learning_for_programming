import React, { useState } from 'react';

//mui
import { TextField, Typography, Select, MenuItem } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    select: {
        width: '95%',
        margin: 5,
    },

    text: {
        marginBottom: 10,
    },

    root: {
        maxHeight: 150,
        padding: 20,
    }
}));

const InputDialog = (props) => {
    const classes = useStyles();

    const types = ['Integer', 'Decimal', 'Text', 'Boolean'];

    const [type, setType] = useState(props.component ? props.component.varType : '');
    const [isArray, setIsArray] = useState(props.component ? props.component.isArray : '');

    const handleSelect = (e) => {
        setType(e.target.value);
        props.handleChange(e);
    }

    const handleIsArray = (e) => {
        setIsArray(e.target.value);
        props.handleChange(e);
    }

    return (
        <div className={classes.root}>            
            <TextField color='primary' onChange={props.handleChange} label="Variable Name" name="var" 
                placeholder="Enter Variable Name" fullWidth className={classes.text} defaultValue={props.component ? props.component.var : ''}
            /><br/>

            <Typography variant='subtitle1'>
                Select Type
            </Typography>

            <Select name="varType" value={type} onChange={handleSelect} className={classes.select}>
                {
                    types.map( (t, index) => {
                        return (
                            <MenuItem key={index} value={t}>
                                {t}
                            </MenuItem>
                        )
                    })
                }
            </Select>

            <Typography variant="subtitle1">
                Is it an array?
            </Typography>

            <Select name="isArray" value={isArray} onChange={handleIsArray} className={classes.select}>
                {
                    [false, true].map( (e, index) => {
                        return (
                            <MenuItem key={index} value={e}>
                                { e === true ? 'YES' : 'NO'}
                            </MenuItem>
                        )
                    })
                }
            </Select>
        </div>
    )
}

export default InputDialog;