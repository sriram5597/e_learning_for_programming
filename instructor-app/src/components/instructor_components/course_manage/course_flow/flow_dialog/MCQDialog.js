import React, { useState } from 'react';

//components
import MCQ from '../../mcq/MCQ';
import CustomDialog from './CustomDialog';

//mui
import { IconButton } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

//mui/icons
import { FormatListBulleted, Close } from '@material-ui/icons';

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

const MCQDialog = (props) => {
    const classes = useStyles();

    const [open, setOpen] = useState(false);

    const handleOpen = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    console.log(props.updateAfterMutation);

    return (
        <div>
            <IconButton onClick={handleOpen} className={classes.iconButton}>
                <FormatListBulleted color='primary' className={classes.icon} />
            </IconButton>
            <CustomDialog open={open} type="MCQ" handleClose={handleClose}>
                <MCQ source={props.source} updateAfterMutation={props.updateAfterMutation} />
            </CustomDialog>
        </div>
    )
}

export default MCQDialog;