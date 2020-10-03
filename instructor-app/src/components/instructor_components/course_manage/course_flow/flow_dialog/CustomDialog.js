import React, { useState, useEffect } from 'react';

//utils
import TipButton from '../../../../../utils/TipButton';

//mui
import { DialogTitle, Dialog, DialogContent, AppBar, Toolbar, Typography } from '@material-ui/core';

//mui/icons
import { Close } from '@material-ui/icons';

const CustomDialog = (props) => {
    const [open, setOpen] = useState(props.open);

    useEffect( () => {
        setOpen(props.open);
    }, [props.open]);

    return (
        <Dialog open={open} fullScreen maxWidth="lg">
            <DialogTitle>
                <AppBar>
                    <Toolbar>
                        <TipButton tip="close" onClick={props.handleClose}>
                            <Close />
                        </TipButton>
                        <Typography variant='h5'>
                            {props.type}
                        </Typography>
                    </Toolbar>
                </AppBar>
            </DialogTitle>
            <DialogContent>
                {props.children}
            </DialogContent>
        </Dialog>
    )
}

export default CustomDialog;