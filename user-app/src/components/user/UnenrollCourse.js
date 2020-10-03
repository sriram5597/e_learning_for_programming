import React, { useState } from 'react';

//graphql
import { useMutation } from '@apollo/react-hooks';
import { UNENROLL_COURSE } from '../../graphql/mutation/currentCourseMutation';

//mui
import { MenuItem, Dialog, DialogActions, DialogTitle, DialogContent, Button, CircularProgress, Typography, TextField } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme) => ({
    errorText: {
        color: theme.palette.alert.main
    }
}));

const UnenrollCourse = (props) => {
    const classes = useStyles();

    const [status, setStatus] = useState({});
    const [open, setOpen] = useState(false);
    const [comment, setComment] = useState();
    const [isUnenroll, setIsUnenroll] = useState(false);

    const [unenrollCourse, { loading }] = useMutation(UNENROLL_COURSE, {
        onError: (err) => {
            setStatus({
                open: true,
                message: err.message,
                status: "ERROR"
            });
            setOpen(false);
            setIsUnenroll(false);
        },
        onCompleted: (data) => {
            setOpen(false);
            setIsUnenroll(false);
            setStatus({
                open: true,
                status: "SUCCESS",
                message: data.unenrollCourse.message
            });
        }
    });

    const handleUnenroll = () => {
        const variables = {
            course_title: props.course_title,
            course_id: props.course_id,
            comment
        }

        console.log(variables);
        unenrollCourse({
            variables: {
                ...variables
            }
        });
    }

    const handleDialogOpen = () => {
        setOpen(true);
    }

    const handleDialogClose = () => {
        setOpen(false);
    }

    const handleNotify = () => {
        if(status.status === 'SUCCESS'){
            window.location.pathname = '/';
        }
        else{
            setStatus({
                ...status,
                open: false
            });
        }
    }

    const handleCancel = () => {
        setIsUnenroll(false);
        setOpen(false);
    }

    const handleChange = (e) => {
        setComment(e.target.value);
    }

    const handleIsUnenroll = () => {
        setIsUnenroll(true);
    }

    return (
        <div>
            <MenuItem onClick={handleDialogOpen}>
                Unenroll
            </MenuItem>

            <Dialog open={status.open}>
                <DialogTitle>
                    <Typography color='primary'>
                        Unenroll Course
                    </Typography>
                </DialogTitle>
                <DialogContent className={status.status === 'ERROR' ? classes.errorText : null}>
                    {status.message}
                </DialogContent>
                <DialogActions>
                    <Button variant='contained' color='primary' onClick={handleNotify}>
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={open} onClose={handleDialogClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Typography color='primary'>
                        Unenroll Course
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    {
                        isUnenroll ? (
                            <TextField variant='outlined' color='primary' label="Reason for unenrolling this course" placeholder="Please
                                provide your reason for unenrolling this course to improve our service" onChange={handleChange} multiline
                                rows="5" fullWidth
                            />
                        ) : (
                            <Typography variant='body1'>
                                After unenrolling this course, you are no longer have access to this course. If you have bought full version of this
                                course, you have to buy the course again when you want to take this course again.<br/>
                                <strong>
                                    Are you sure want to unenroll this course?
                                </strong>
                            </Typography>
                        )
                    }
                    
                </DialogContent>
                <DialogActions>
                    {
                        isUnenroll ? (
                            <div>
                                <Button variant='outlined' color='primary' onClick={handleCancel}>
                                    Cancel
                                </Button>
                                <Button variant="contained" color='primary' onClick={handleUnenroll} diabled={loading}>
                                    Submit
                                    {
                                        loading && (
                                            <CircularProgress size={30} color='primary' />
                                        )
                                    }
                                </Button>
                            </div>
                        ) : (
                            <div>
                                <Button variant='outlined' onClick={handleDialogClose} color='primary'>
                                    No
                                </Button>
                                <Button variant='contained' onClick={handleIsUnenroll} color='primary'>
                                    Yes
                                </Button>
                            </div>
                        )
                    }
                    
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default UnenrollCourse;