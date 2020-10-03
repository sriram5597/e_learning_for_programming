import React, { useState } from 'react';

//graphql
import { useMutation } from '@apollo/react-hooks';
import { DELETE_SOURCE } from '../../../../../graphql/mutation/courseFlowMutations';
import { GET_FLOW } from '../../../../../graphql/queries/courseFlowQueries';

//utils
import TipButton from '../../../../../utils/TipButton';

//mui
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Backdrop, CircularProgress } from '@material-ui/core';

//mui/icon
import { Delete } from '@material-ui/icons';

const DeleteSource = (props) => {
    const { course_id, title, source } = props;

    const [ open, setOpen ] = useState(false);

    const [deleteSource, { loading }] = useMutation(DELETE_SOURCE, {
        onError: (err) => {
            console.log(err);
        },
        update: (cache, { data }) => {
            cache.writeQuery({
                query: GET_FLOW,
                variables: {
                    course_id,
                    title
                },
                data: {
                    getFlow: data.deleteSource
                }
            });
        }
    })
    
    const handleDelete = () => {
        deleteSource({
            variables: {
                course_id,
                title,
                source
            }
        });

        setOpen(false);
    }

    const handleOpen = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    return (
        <div>
            <Backdrop open={loading} >
                <CircularProgress color='primary' />
            </Backdrop>
            <TipButton onClick={handleOpen} tip='delete source' btnColor='secondary'>
                <Delete />
            </TipButton>

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    Delete Source
                </DialogTitle>
                <DialogContent>
                    <Typography variant='body1'>
                        Are you sure want to delete this source?
                    </Typography>
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

export default DeleteSource;