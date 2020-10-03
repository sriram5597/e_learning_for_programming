import React, { useState } from 'react';

//components
import Content from '../../text_content/Content';
import CustomDialog from './CustomDialog';

//mui
import { IconButton } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

//mui/icons
import { Description } from '@material-ui/icons';

const useStyles = makeStyles( (theme) => ({
    icon: {
        fontSize: 80
    },

    iconButton: {
        position: 'relative',
        left: '30%',
    },

    head: {
        flexGrow: 1,
    }
}));

const TextDialog = (props) => {
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
            <IconButton onClick={handleOpen} className={classes.iconButton}>
                <Description color='primary' className={classes.icon} />
            </IconButton>

            <CustomDialog open={open} type="TEXT" handleClose={handleClose}>
                <Content source={props.source} updateAfterMutation={props.updateAfterMutation} />
            </CustomDialog>
        </div>
    )
}

export default TextDialog;