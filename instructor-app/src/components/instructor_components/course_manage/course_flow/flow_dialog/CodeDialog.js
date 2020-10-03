import React, { useState } from 'react';

//components
import PreviewProblem from '../../problem_components/update_problems/PerviewProblem';
import CompileCode from '../../../../problem/CompileCode';
import CustomDialog from './CustomDialog';

//mui
import { IconButton } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

//mui/icons
import { Code } from '@material-ui/icons';

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

const CodeDialog = (props) => {
    const classes = useStyles();

    const [open, setOpen] = useState(false);
    const [manage, setManage] = useState(true);

    const handleOpen = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const handleManage = () => {
        setManage(!manage);
    }

    return (
        <div>
            <IconButton onClick={handleOpen} className={classes.iconButton}>
                <Code color='primary' className={classes.icon} />
            </IconButton>
            <CustomDialog open={open} handleClose={handleClose}>
                {
                    manage ? (
                        <PreviewProblem source={props.source} setManage={handleManage} title={props.title} course_id={props.course_id} 
                            updateAfterMutation={props.updateAfterMutation}
                        />
                    ) : (
                        <CompileCode source={props.source} setManage={handleManage} />
                    )
                }
            </CustomDialog>
        </div>
    )
}

export default CodeDialog;