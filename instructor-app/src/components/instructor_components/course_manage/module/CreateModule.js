import React, { useState } from 'react';

//graphql
import { useMutation } from '@apollo/react-hooks';
import { CREATE_MODULE } from '../../../../graphql/mutation/moduleMutations';

//utils
import TipButton from '../../../../utils/TipButton';
import formValidator from '../../../../utils/formValidator';
import UpdateSnackbar from '../../../../utils/UpdateSnackbar';

//mui
import { Dialog, DialogActions, DialogTitle, DialogContent } from '@material-ui/core';
import { TextField, CircularProgress, Button } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

//mui/icons
import { AddCircle, Close } from '@material-ui/icons';
import { GET_COURSE } from '../../../../graphql/queries/courseQueries';

const useStyles = makeStyles( (theme) => ({
    addButton: {
        position: 'relative',
        left: '40%',
    },

    text: {
        position: "relative",
        margin: 20,
        maxWidth: "90%"
    },

    edit: {
        position: "relative",
        float: "right"
    }
}));

const CreateModule = (props) => {
    const classes = useStyles();

    const [ createModule, { loading } ] = useMutation(CREATE_MODULE, {
        onError: (err) => {
            console.log(err);
        },
        update: (cache, { data }) => {
            let cache_data = cache.readQuery({query: GET_COURSE, variables: { course_id: props.course_id }});

            const levels = [data.createModule, ];

            cache.writeQuery({
                query: GET_COURSE,
                variables: {
                    course_id: props.course_id
                },
                data: {
                    getCourse: {
                        ...cache_data.getCourse,
                        levels,
                    }
                }
            });
        }
    });

    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        title: "",
        sub_modules: "",
        level: "",
    });
    const [error, setError] = useState({});
    const [snackOpen, setSnackOpen] = useState(false);

    const handleOpen = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    }

    const handleAdd = () => {
        const error = formValidator(form);

        if(error.title || error.sub_modules){
            setError(error);
            return;
        }

        const data = {
            title: form.title,
            sub_modules: form.sub_modules.split('\n'),
            level: `level_${form.level}`
        }

        createModule({
            variables: {
                module: data,
                course_id: props.course_id
            }
        });

        setOpen(false);
        setSnackOpen(true);
        setForm({
            title: "",
            sub_modules: "",
            level: ""
        });
    }

    return (
        <div>
            <TipButton btnColor='primary' onClick={handleOpen} tip="Add Module" btnClassName={classes.addButton}>
                <AddCircle fontSize="large" />
            </TipButton>

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <DialogTitle>
                    Add Module
                    <TipButton tip="close" btnClassName={classes.edit} btnColor="secondary" onClick={handleClose}>
                        <Close/>
                    </TipButton>
                </DialogTitle>
                <DialogContent>
                    <TextField fullWidth name="title" variant="filled" color="primary" className={classes.text}
                            placeholder="Enter Module Title" label="Module Title" onChange={handleChange} error={error.title ? true : false}
                            helperText={error.title} defaultValue={form.title ? form.title : null}
                    />
                    <TextField fullWidth name="sub_modules" variant="filled" color="primary" className={classes.text}
                            placeholder="Enter sub_modules" multiline rows="6" label="Sub Modules" onChange={handleChange}
                            error={error.sub_modules ? true : false} helperText={error.sub_modules} 
                            defaultValue={form.sub_modules ? form.sub_modules : null}
                    />
                    <TextField fullWidth name="level" variant="filled" color="primary" className={classes.text}
                            placeholder="Enter Level" label="Level" onChange={handleChange}
                            error={error.level ? true : false} helperText={error.level} 
                            defaultValue={form.level ? form.level : null}
                    />    
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="primary" className={classes.button} onClick={handleAdd} disabled={loading}>
                        { loading && (
                            <CircularProgress size={30} color="primary"/>
                        )}
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
            <UpdateSnackbar open={snackOpen}/>
        </div>
    )
}

export default CreateModule;