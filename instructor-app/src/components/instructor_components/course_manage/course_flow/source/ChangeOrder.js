import React, { useState } from 'react';

//graphql
import { useMutation } from '@apollo/react-hooks';
import { CHANGE_ORDER } from '../../../../../graphql/mutation/courseFlowMutations';
import { GET_FLOW } from '../../../../../graphql/queries/courseFlowQueries';

//utils
import TipButton from '../../../../../utils/TipButton';
import UpdateSnackbar from '../../../../../utils/UpdateSnackbar';

//mui
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Typography, Backdrop, CircularProgress } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

//mui/icons
import { SwapHorizontalCircle } from '@material-ui/icons';

const useStyles = makeStyles( (theme) => ({
    backdrop: {
        zIndex: 4,
        color: '#fff'
    }
}))

const ChangeOrder = (props) => {
    const classes = useStyles();

    const { course_id, title, old_index } = props;

    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [index, setIndex] = useState();

    const [changeSourceOrder, { loading }] = useMutation(CHANGE_ORDER, {
        onError: (err) => {
            console.log(error);
        },
        update: (cache, { data }) => {
            console.log(data.changeOrder);

            cache.writeQuery({
                query: GET_FLOW,
                variables: {
                    course_id,
                    title
                },
                data: {
                    getFlow: data.changeOrder
                }
            });
        },
        onCompleted: () => {
            setStatus(true);
        }
    });

    const handleOpen = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const handleChange = (e) => {
        setIndex(parseInt(e.target.value));
    }

    const changeOrder = () => {
        changeSourceOrder({
            variables: {
                course_id,
                title,
                old_index: parseInt(old_index), 
                index: parseInt(index)
            }
        });

        setOpen(false);
    }

    return (
        <div>
            <Backdrop open={loading} className={classes.backdrop}>
                <CircularProgress color='primary' />
            </Backdrop>
            
            <TipButton tip="change order" onClick={handleOpen} btnColor='primary'>
                <SwapHorizontalCircle />
            </TipButton>

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Typography color='primary'>
                        Change Source Order
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <TextField variant='outlined' color='primary' onChange={handleChange} label="Position" defautlValue={`${index}`} 
                        placeholder="Enter New Position" 
                    />
                </DialogContent>
                <DialogActions>
                    <Button variant='outlined' color='secondary' onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant='contained' color='primary' onClick={changeOrder}>
                        Change
                    </Button>
                </DialogActions>
            </Dialog>
            <UpdateSnackbar msg="Order Changed" open={status} />
        </div>
    )
}

export default ChangeOrder;