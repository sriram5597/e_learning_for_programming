import React, { useState } from 'react';

//graphql
import { useMutation } from '@apollo/react-hooks';
import { UPDATE_QUESTION } from '../../../../graphql/mutation/mcqMutations';

//utils
import TipButton from '../../../../utils/TipButton';

//MUI
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import { Button } from "@material-ui/core";

//MUI/styles
import { makeStyles } from '@material-ui/styles';

//MUI icons
import { Delete } from '@material-ui/icons';

const useStyles = makeStyles( (theme) => ({
    delete: {
        position: "absolute",
        left: "90%"
    }
}));

const DeleteMCQ = (props) => {
    const classes = useStyles();

    const [updateQuestion] = useMutation(UPDATE_QUESTION, {
        onError: (err) => {
            console.log(err);
        },
        update: (cache, { data }) => {
            props.updateAfterMutation(cache, data, 'updateQuestion');
        }
    });

    const [open, setOpen] = useState(false);

    const handleOpen = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const handleDelete = () => {
        updateQuestion({
            variables: {
                mcq_id: props.source.source.mcq_id,
                index: props.index,
                op: 'delete'
            }
        });
        
        setOpen(false);
    }

    return (
        <div className={classes.delete}>
            <TipButton tip="delete MCQ" onClick={handleOpen} btnColor="secondary">
                <Delete/>
            </TipButton>
            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    Confirmation
                </DialogTitle>
                <DialogContent>
                    Are you sure want to delete?
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="primary" onClick={handleDelete}>
                        Yes
                    </Button>
                    <Button variant="contained" color="secondary" onClick={handleClose}>
                        No
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default DeleteMCQ;