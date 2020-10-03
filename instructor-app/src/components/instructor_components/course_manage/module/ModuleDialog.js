import React, { useState, useEffect } from 'react';

//graphql
import { useMutation, useQuery } from '@apollo/react-hooks';
import { UPDATE_MODULE, UPDATE_LEVEL, DELETE_MODULE } from '../../../../graphql/mutation/moduleMutations';
import { GET_MODULES } from '../../../../graphql/queries/moduleQueries';
import { GET_COURSE } from '../../../../graphql/queries/courseQueries';

//utils
import formValidator from '../../../../utils/formValidator';
import TipButton from '../../../../utils/TipButton';
import UpdateSnackbar from '../../../../utils/UpdateSnackbar';

//MUI
import { Dialog, DialogContent, DialogActions, DialogTitle } from '@material-ui/core';
import { TextField, Button, CircularProgress } from '@material-ui/core';

//MUI/styles
import { makeStyles } from '@material-ui/styles';

//MUI Icon
import { Edit, Close, Delete } from '@material-ui/icons';

const useStyles = makeStyles( (theme) => ({
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

const ModuleDialog = (props) => {
    const classes = useStyles();

    const { data, loading } = useQuery(GET_COURSE, {
        variables: {
            course_id: props.course_id
        }
    });
    const [ updateModule, updateModuleOutput ] = useMutation(UPDATE_MODULE, {
        onError: (err) => {
            console.log(err);
        },
        update: (cache, { data }) => {
            const cache_data = cache.readQuery({query: GET_COURSE, variables: { course_id: props.course_id }});

            cache.writeQuery({
                query: GET_COURSE,
                variables: {
                    course_id: props.course_id
                },
                data: {
                    getCourse: {
                        ...cache_data.getCourse,
                        levels: data.updateModule
                    }
                }
            });

        }
    });

    const [ deleteModule ] = useMutation(DELETE_MODULE, {
        onError: (err) => {
            console.log(err);
        },
        onCompleted: () => {
            props.setModule(null, null, null);
        },
        refetchQueries: [
            {
                query: GET_COURSE,
                variables: {
                    course_id: props.course_id
                }
            }
        ]
    });
    
    const { level, module } = props.selectedModule ? props.selectedModule : {level: undefined, module: undefined};

    const [error, setError] = useState({});
    const [modified, setModified] = useState(false);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({});
    const [snackOpen, setSnackOpen] = useState(false);

    useEffect( () => {
        if(level !== undefined && module){
            setForm({
                title:  module.title,
                level: `level_${level}`,
                sub_modules: module.sub_modules.join('\n')
             });
        }
    }, [props.selectedModule, props.modules]);

    const handleChange = (event) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value
        });
    
        setModified(true);
    }

    const handleOpen = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setError({});
        setOpen(false);
    }

    const handleDelete = () => {
        deleteModule({
            variables: {
                level: `level_${props.selectedModule.level}`,
                index: `${props.selectedModule.moduleIndex}`,
                course_id: props.course_id
            }
        });
    }

    const handleUpdate = () => {
        console.log(form);
        const err = formValidator(form);
        setError(err);
    
        let data = {};

        if(!(err.title || err.sub_modules || err.level)){
            const title = module.title;
            const sub_modules = module.sub_modules;

            if(form.title !== title)
                data['title'] = form.title;
            data['sub_modules'] = form.sub_modules.split('\n');

            updateModule({
                variables: {
                    module: data,
                    course_id: props.course_id,
                    index: `${props.selectedModule.moduleIndex}`,
                    level: `level_${level}`
                }
            });

            setSnackOpen(true);
            setModified(false);
        }
    }

    console.log(props.selectedModule);

    if(!props.selectedModule){
        return <div></div>;
    }

    return (
        <span>
            <TipButton tip="edit module" btnColor="primary" onClick={handleOpen} className={classes.edit} 
                    disabled={(module === undefined) ? true : false}>
                <span>
                    <Edit/>
                </span>
            </TipButton>
            <TipButton tip="delete module" btnColor="secondary" onClick={handleDelete} className={classes.edit} 
                    disabled={(module === undefined) ? true : false}>
                <span>
                    <Delete/>
                </span>
            </TipButton>

            <Dialog open={props.isAdd ? props.isAdd : open} onClose={handleClose} fullWidth maxWidth="md">
                <DialogTitle>
                    Update Module
                    <TipButton tip="close" btnClassName={classes.edit} btnColor="secondary" onClick={handleClose}>
                        <Close/>
                    </TipButton>
                </DialogTitle>
                <DialogContent>
                        <TextField fullWidth name="title" variant="filled" color="primary" className={classes.text}
                                placeholder="Enter Module Title" label="Module" onChange={handleChange} error={error.title ? true : false}
                                helperText={error.title} defaultValue={form.title ? form.title : null}
                        />
                        <TextField fullWidth name="sub_modules" variant="filled" color="primary" className={classes.text}
                                placeholder="Enter sub_moduless" multiline rows="6" label="Sub Modules" onChange={handleChange}
                                error={error.sub_modules ? true : false} helperText={error.sub_modules} 
                                defaultValue={form.sub_modules ? form.sub_modules : null}
                        />
                        
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="primary" className={classes.button} onClick={handleUpdate} disabled={updateModule.loading || !modified}>
                        { 
                            updateModuleOutput.loading && (
                                <CircularProgress size={30} color="primary"/>
                            )
                        }
                        Update
                    </Button>
                </DialogActions>
            </Dialog>
            <UpdateSnackbar open={snackOpen}/>
        </span>
    )
}

export default ModuleDialog;