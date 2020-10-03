import React, { useState } from 'react';

//mui
import { Dialog, DialogTitle, DialogContent, IconButton, Typography } from '@material-ui/core';

//mui/icons
import { Close } from '@material-ui/icons';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    image: {
        position: 'relative',
        left: '30%',
        padding: '1.5em',
        '&:hover':{
            borderStyle: 'solid',
            borderWidth: '1px'
        }
    }
}))

const FlowchartView = (props) => {
    const classes = useStyles();

    const [open, setOpen] = useState(false);

    const handleOpen = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    return (
        <div>
            <img src={props.url} width='380vh' height='400vh' alt={props.title} onClick={handleOpen} className={classes.image} />
            <Dialog open={open} maxWidth="xl" fullWidth>
                <DialogTitle>
                    <IconButton onClick={handleClose} color='primary'>
                        <Close />
                    </IconButton>
                    <Typography color='primary'>
                        <strong>
                            {props.title}
                        </strong>
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <img src={props.url} width="80%" height="1000vh" />
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default FlowchartView;