import React, { useState, useEffect } from 'react'

//MUI
import { Snackbar, SnackbarContent } from '@material-ui/core';
import { IconButton } from '@material-ui/core';
import { Alert } from '@material-ui/lab';

//MUI/styles
import { makeStyles } from '@material-ui/styles';

//MUI/icons
import { Close, CheckCircle } from '@material-ui/icons';

const useStyles = makeStyles( (theme) => ({
    success: {
        backgroundColor: theme.palette.success.main,
        color: '#ffffff'
    },
    alert: {
        backgroundColor: theme.palette.alert.main,
        color: '#ffffff'
    }
}));

const UpdateSnackbar = (props) => {
    const classes = useStyles();
    const [open, setOpen] = useState(false);

    const msg = props.msg ? props.msg : "Updated";
    const status = props.status;

    useEffect(() => {
        setOpen(props.open);
    }, [props.open]);

    const handleClose = () => {
        setOpen(false);
    }

    return (
        <Snackbar anchorOrigin={{
            vertical: "bottom",
            horizontal: 'left'
          }}
          open={open}
          onClose={handleClose}
          autoHideDuration={20000}
        >  
            {
                status === 'SUCCESS' ? (
                    <Alert severity="success" onClose={handleClose} >
                        {msg}
                    </Alert>
                ) : (
                    <Alert severity="error" onClose={handleClose} >
                        {msg}
                    </Alert>
                )
            }
        </Snackbar>
    );
}

export default UpdateSnackbar;