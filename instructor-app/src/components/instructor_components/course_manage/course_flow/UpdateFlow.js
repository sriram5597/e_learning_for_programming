import React, { useState } from 'react';

//graphql
import { useMutation } from '@apollo/react-hooks';
import { UPDATE_TITLE } from '../../../../graphql/mutation/courseFlowMutations';
import { GET_LEVEL_FLOWS } from '../../../../graphql/queries/courseFlowQueries';

//utils
import TipButton from '../../../../utils/TipButton';

//mui
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, TextField, CircularProgress } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

//mui/icons
import { Edit } from '@material-ui/icons';

const useStyles = makeStyles( (theme) => ({
    deleteButton: {
        position: 'relative',
        left: '30%',
    },
}));

const UpdateFlow = (props) => {
    const classes = useStyles();

    const { course_id } = props;
    const old_title = props.title;

    const [title, setTitle] = useState(old_title);

    const [updateFlow, { loading }] = useMutation(UPDATE_TITLE, {
        onError: (err) => {
            console.log(err);
        },
        onCompleted: () => {
            setOpen(false);
        },
        refetchQueries: [
            {
                query: GET_LEVEL_FLOWS,
                variables: {
                    course_id
                }
            }
        ]
    });

    const [open, setOpen] = useState(false);

    const handleChange = (e) => {
        setTitle(e.target.value);
    }

    const handleUpdate = () => {
        const variables = {
            course_id,
            title,
            old_title
        }

        console.log(variables);

        updateFlow({
            variables: {
                ...variables
            }
        });
    }

    const handleOpen = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    return (
        <div className={classes.deleteButton}>
            <TipButton tip="update flow" btnColor="primary" onClick={handleOpen}>
                <Edit />
            </TipButton>

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Typography variant="h6">
                        Update Flow
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <TextField value={title} onChange={handleChange} color='primary' variant='outlined' fullWidth label="Flow Title"
                        placeholder="Enter Flow Title"
                    />
                </DialogContent>
                <DialogActions>
                    <Button variant='outlined' color='secondary' onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant='contained' color='primary' onClick={handleUpdate} disabled={title === old_title || loading}>
                        Update
                        {
                            loading && (
                                <CircularProgress size={30} color='primary' />
                            )
                        }
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default UpdateFlow;