import React, { useState, } from 'react';

//graphql
import { useMutation } from '@apollo/react-hooks';
import { UPDATE_SAMPLE_TESTCASE, DELETE_TESTCASE } from '../../../../../../graphql/mutation/problemMutation';

//utils
import TipButton from '../../../../../../utils/TipButton';

//mui
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@material-ui/core';
import { Button, Backdrop, CircularProgress } from '@material-ui/core';

//mui/icons
import { Delete } from '@material-ui/icons';

import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    backdrop: {
        zIndex: 4,
        color: '#fff'
    }
}));

const DeleteDialog = (props) => {
    const classes = useStyles();

    const { index, problem } = props;
    const sample = props.sample ? true : false;

    const [open, setOpen] = useState(false);

    const [updateSampleTestcase, { loading }] = useMutation(UPDATE_SAMPLE_TESTCASE, {
        onError: (err) => {
            console.log(err);
        },
        update: (cache, { data }) => {
            props.updateAfterMutation(cache, data, 'updateSampleTestcase');
        }
    });

    const [deleteTestcase, deleteTestcaseData] = useMutation(DELETE_TESTCASE, {
        onError: (err) => {
            console.log(err);
        },
        update: (cache, { data }) => {
            props.updateAfterMutation(cache, data, 'deleteTestcase');
        }
    });

    const handleDelete = () => {
        const data = {
            index,
            max_score: problem.max_score,
        }

        if(sample){
            updateSampleTestcase({
                variables: {
                    problem_id: problem.problem_id,
                    index,
                    op: 'delete'
                }
            });
        }
        else{
            deleteTestcase({
                variables: {
                    problem_id: problem.problem_id,
                    index
                }
            });
        }

        setOpen(false);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const handleOpen = () => {
        setOpen(true);
    }

    return (
        <span>
            <Backdrop open={loading || deleteTestcaseData.loading} className={classes.backdrop}>
                <CircularProgress size={50} color='primary' />
            </Backdrop>
            <TipButton tip='delete' btnColor="secondary" onClick={handleOpen}>
                <Delete />
            </TipButton>

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
                <DialogTitle>
                    <Typography color='primary'>
                        {`Delete ${sample ? "Sample Testcase " : "Testcase"}`}
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    Are you sure want to delete this testcase?
                </DialogContent>
                <DialogActions>
                    <Button variant='contained' color='primary' onClick={handleDelete}>
                        Yes
                    </Button>
                    <Button variant='outlined' color='secondary' onClick={handleClose}>
                        No
                    </Button>
                </DialogActions>
            </Dialog>
        </span>
    )
}

export default DeleteDialog;