import React, { useState } from 'react';
import PropTypes from 'prop-types';

//mui
import { Typography, IconButton } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

//icons
import { CheckCircle, ErrorRounded, Cancel } from '@material-ui/icons';

const useStyles = makeStyles( (theme) => ({
    root: {
        padding: 10,
        fontSize: '18px',
        display: 'flex',
    },

    hideBar: {
        dispaly: 'none',
    },

    success: {
        backgroundColor: theme.palette.success.light,
        color: theme.palette.success.main,
    },

    error: {
        backgroundColor: theme.palette.alert.light,
        color: theme.palette.alert.main,
    }
}));


const StatusBar = (props) => {
    const classes = useStyles();

    const { status, text } = props;
    const [ isHidden, setIsHidden ] = useState(false);

    const getIcon = () => {
        switch(status){
            case 'SUCCESS': 
                    return <CheckCircle />
            
            case 'ERROR': 
                    return <ErrorRounded />
            
            default: 
                    return null;
        }
    }

    const handleHide = () => {
        setIsHidden(true);
    }

    return (
        <div className={isHidden ? classes.hideBar : classes.root}>
            <span className={status === 'SUCCESS' ? classes.success : classes.error}>
                {getIcon}
                <Typography variant="h6">
                    {text}
                </Typography>
            </span>
            <IconButton color='secondary' onClick={handleHide}>
                <Cancel />
            </IconButton>
        </div>
    )
}

StatusBar.propTypes = {
    status: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
}

export default StatusBar;