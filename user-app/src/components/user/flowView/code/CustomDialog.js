import React, { useState, useEffect } from 'react';

//utils
import TipButton from '../../../../utils/TipButton';

//mui
import { DialogTitle, Dialog, DialogContent, Typography } from '@material-ui/core';

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
                <div style={{display: 'flex'}}>
                    <TipButton tip="close" btnColor='secondary' onClick={props.handleClose}>
                        <Close />
                    </TipButton>
                    <Typography variant='h4' color='primary'>
                        {props.title}
                    </Typography>
                </div>
            </DialogTitle>
            <DialogContent>
                {props.children}
            </DialogContent>
        </Dialog>
    )
}

export default CustomDialog;