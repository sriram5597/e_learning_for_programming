import React, { useState } from 'react';

//graphql
import { useMutation } from '@apollo/react-hooks';
import { DELETE_FLOW } from '../../../../graphql/mutation/courseFlowMutations';
import { GET_LEVEL_FLOWS } from '../../../../graphql/queries/courseFlowQueries';

//utils
import TipButton from '../../../../utils/TipButton';

//mui
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

//mui/icons
import { Delete } from '@material-ui/icons';

const useStyles = makeStyles( (theme) => ({
    deleteButton: {
        position: 'relative',
        left: '30%',
    },
}));

const DeleteFlow = (props) => {
    const classes = useStyles();

    const { title, level, course_id } = props;

    const [deleteFlow, { loading }] = useMutation(DELETE_FLOW, {
        onError: (err) => {
            console.log(err);
        },
        update: (cache, { data }) => {
            const cache_data = cache.readQuery(
                {
                    query: GET_LEVEL_FLOWS,
                    variables: course_id
                }
            );
            let flows = cache_data.getLevelFlows;

            flows = flows.filter( (f) => f.title !== title && f.course_id !== course_id);

            cache.writeQuery({
                query: GET_LEVEL_FLOWS,
                variables: course_id,
                data: {
                    getLevelFlows: data.deleteFlow
                }
            });
        }
    });

    const [open, setOpen] = useState(false);

    const handleDelete = () => {
        deleteFlow({
            variables: {
                title,
                course_id
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
            <TipButton tip="delete flow" btnColor="secondary" onClick={handleOpen}>
                <Delete />
            </TipButton>
            
            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Typography variant="h6">
                        Delete Flow
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    Are you sure want to delete entire flow?
                </DialogContent>
                <DialogActions>
                    <Button variant='outlined' color='primary' onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant='contained' color='secondary' onClick={handleDelete}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default DeleteFlow;