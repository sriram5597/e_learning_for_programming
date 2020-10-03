import React, { useState } from 'react';

//components
import CompileCode from '../../../problem/CompileCode';
import CustomDialog from './CustomDialog';

//mui
import { Button } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    iconButton: {
        position: 'relative',
        left: '40%',
        marginTop: 50,
    },
}));

const CodeDialog = (props) => {
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
            <Button onClick={handleOpen} variant='contained' color='primary' className={classes.iconButton}>
                Solve
            </Button>
            <CustomDialog open={open} handleClose={handleClose} title={props.source.source_title}>
                <CompileCode source={props.source} course_id={props.course_id} />
            </CustomDialog>
        </div>
    )
}

export default CodeDialog;