import React, { useState, useEffect } from 'react'

//MUI
import { Snackbar, SnackbarContent } from '@material-ui/core';
import { IconButton } from '@material-ui/core';

//MUI/styles
import { makeStyles } from '@material-ui/styles';

//MUI/icons
import { Close, CheckCircle } from '@material-ui/icons';

const useStyles = makeStyles( (theme) => ({
    success: {
        color: theme.palette.success.main,
    }
}));

const UpdateSnackbar = (props) => {
    const classes = useStyles();
    const [open, setOpen] = useState(false);

    const msg = props.msg ? props.msg : "Updated";

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
            <SnackbarContent 
                    message={<span><CheckCircle/>{msg}</span>}
                    action={[
                        <IconButton key="close" onClick={handleClose} color="inherit">
                            <Close/>
                        </IconButton>
                    ]}
                    className={classes.success}
            />
        </Snackbar>
    );
}

export default UpdateSnackbar;