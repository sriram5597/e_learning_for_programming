import React from 'react';
import PropTypes from 'prop-types';

//mui
import { Typography } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

//icons
import { CheckCircle, ErrorRounded } from '@material-ui/icons';

const useStyles = makeStyles( (theme) => ({
    error: {
        position: 'relative',
        padding: 10,
        fontSize: '18px',
        width: '98%',
        backgroundColor: theme.palette.alert.light,
        color: theme.palette.alert.main,
        zIndex: 4,
    },

    success: {
        position: 'relative',
        padding: 10,
        fontSize: '18px',
        width: '98%',
        backgroundColor: theme.palette.success.light,
        color: theme.palette.success.main,
        zIndex: 4,
    },
}));


const StatusBar = (props) => {
    const classes = useStyles();

    const { status, text } = props;

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

    return (
        <div className={status === 'SUCCESS' ? classes.success : classes.error}>
            <Typography variant="h6">
                {getIcon()}
                {text}
            </Typography>
        </div>
    )
}

StatusBar.propTypes = {
    status: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
}

export default StatusBar;