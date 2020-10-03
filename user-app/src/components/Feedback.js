import React, { useState } from 'react';

//redux
import { connect } from 'react-redux';

//graphql
import { useMutation } from '@apollo/react-hooks';
import { POST_FEEDBACK } from '../graphql/mutation/currentCourseMutation';

//utils
import UpdateSnackbar from '../utils/UpdateSnackbar';

//mui
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Select, MenuItem, Button, Typography, FormControl, CircularProgress 

} from '@material-ui/core';

//icons
import { Feedback } from '@material-ui/icons';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    content: {
        position: 'relative',
        padding: 20
    },

    button: {
        padding: 0,
        float: 'right'
    },

    text: {
        position: "relative",
        margin: 20,
        width: '60vh'
    },

    controls: {
        position: 'relative',
        width: '90%',
    },

    errorText: {
        color: theme.palette.alert.main
    }
}));

const PostFeedback = (props) => {
    const classes = useStyles();

    const { user } = props.auth;

    const [open, setOpen] = useState(false);
    const [data, setData] = useState({
        category: "General Feedback"
    });
    const [snackData, setSnackData] = useState({
        open: false,
        status: "",
        msg: ""
    });

    const categories = ["General Feedback", "Video Issue", "Feature Request", "Report Error", "Course Content Issue", "Online Coding Issue"];

    const [postFeedback, { loading, error }] = useMutation(POST_FEEDBACK, {
        onCompleted: () => {
            setOpen(false);
            setSnackData({
                open: true,
                status: "SUCCESS",
                msg: "Feedback Submitted"
            });
        }
    });

    const handleOpen = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const handleChange = (e) => {
        setData({
            ...data,
            [e.target.name]: e.target.value
        });
    }

    const handlePost = () => {
        console.log(data);
        console.log(user.email);

        postFeedback({
            variables: {
                feedback: {
                    ...data,
                    email: user.email,
                    date: new Date().toISOString()
                }
            }
        });
    }

    return (
        <div className={classes.root}>
            <Button color='inherit' size='large' startIcon={<Feedback />} onClick={handleOpen} className={classes.button}>
                <strong>
                    Feedback
                </strong>
            </Button>
            <Dialog open={open} maxWidth="md">
                <DialogTitle>
                    <Typography color='primary'>
                        Feedback
                    </Typography>
                </DialogTitle>
                <DialogContent className={classes.content}>
                    <div>
                        <Typography variant='subtitle1'>
                            Thank you for providing feedback.
                        </Typography>
                    </div>
                    <div className={classes.controls}>
                        <FormControl>
                            <div className={classes.text}>
                                <Typography variant='caption' id="category">
                                    Select the type of your Feedback
                                </Typography>
                                <br/>
                                <Select value={data.category} onChange={handleChange} name="category" variant='outlined' 
                                    placeholder="Select type of your feedback"
                                >
                                    {
                                        categories.map( (cat, index) => {
                                            return (
                                                <MenuItem key={index} value={cat}>
                                                    {cat}
                                                </MenuItem>
                                            )
                                        })
                                    }
                                </Select>
                            </div>
                            <TextField variant='outlined' onChange={handleChange} name="title" label="Issue" className={classes.text}
                                placeholder="Enter Issue for which you are providing feedback" color='primary'
                            />

                            <TextField variant='outlined' onChange={handleChange} name="comment" label="Comment" className={classes.text}
                                placeholder="Comment your issue in brief" multiline rows="5" color='primary'
                            />
                        </FormControl>
                        {
                            error && (
                                <Typography variant='body1' className={classes.errorText}>
                                    Error: {error.message}
                                </Typography>
                            )
                        }
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} variant='outlined' color='primary'>
                        Cancel
                    </Button>
                    <Button onClick={handlePost} variant='contained' color='primary' disabled={loading}>
                        Post
                        {
                            loading && (
                                <CircularProgress size={30} color='primary' />
                            )
                        }
                    </Button>
                </DialogActions>
            </Dialog>
            <UpdateSnackbar open={snackData.open} status={snackData.status} msg={snackData.msg} />
        </div>
    )
}

const mapStateToProps = (state) => ({
    auth: state.auth,
})

export default connect(mapStateToProps, null)(PostFeedback);