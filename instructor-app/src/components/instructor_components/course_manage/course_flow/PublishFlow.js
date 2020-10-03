import React, { useState } from 'react';

//graphql
import { useMutation } from '@apollo/react-hooks';
import { PUBLISH_FLOW } from '../../../../graphql/mutation/courseFlowMutations';
import { GET_FLOW } from '../../../../graphql/queries/courseFlowQueries';

//utils
import TipButton from '../../../../utils/TipButton';

//mui
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, CircularProgress, Backdrop } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

//mui/icons
import { Publish } from '@material-ui/icons';

const useStyles = makeStyles( (theme) => ({
    deleteButton: {
        position: 'relative',
        left: '30%',
    },
    backdrop: {
        zIndex: 6,
        color: '#fff'
    }
}));

const PublishFlow = (props) => {
    const classes = useStyles();

    const { course_id, published, title } = props;

    const [publishFlow, { loading }] = useMutation(PUBLISH_FLOW, {
        onError: (err) => {
            console.log(err);
        },
        update: (cache, { data }) => {
            cache.writeQuery({
                query: GET_FLOW,
                variables: {
                    title,
                    course_id,
                    role: "instructor"
                },
                data: {
                    getFlow: {
                        ...data.publishFlow
                    }
                }
            })
        }
    });

    const [open, setOpen] = useState(false);

    const handlePublish = () => {
        const data = {
            course_id,
            title,
            publish: published ? false : true
        }

        publishFlow({
            variables: {
                ...data
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
        <div className={classes.deleteButton}>
            <TipButton tip="publish flow" btnColor="primary" onClick={handleOpen}>
                <Publish />
            </TipButton>

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Typography color='primary'>
                        Publish Flow
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        {`Are you sure want to ${!published ? 'publish' : 'unpublish'} this flow?`}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button variant='outlined' color='secondary' onClick={handleClose}>
                        No
                    </Button>
                    <Button variant='contained' color='primary' onClick={handlePublish}>
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>
            <Backdrop open={loading} className={classes.backdrop}>
                <CircularProgress size={50} color='primary' />
            </Backdrop>
        </div>
    )
}

export default PublishFlow;