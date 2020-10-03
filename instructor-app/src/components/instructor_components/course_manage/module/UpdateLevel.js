import React, { useState, useEffect } from 'react';

//graphql
import { useMutation } from '@apollo/react-hooks';
import { UPDATE_LEVEL } from '../../../../graphql/mutation/moduleMutations';
import { GET_COURSE } from '../../../../graphql/queries/courseQueries';

//utils
import UpdateSnackbar from '../../../../utils/UpdateSnackbar';

//mui
import { IconButton, Typography } from '@material-ui/core';
import { TextField, Fab } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

//mui/icons
import { Edit, CheckCircle, CancelRounded } from '@material-ui/icons';

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

const CreateModule = (props) => {
    const classes = useStyles();

    const [ updateLevel ] = useMutation(UPDATE_LEVEL, {
        onError: (err) => {
            console.log(err);
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

    const [level, setLevel] = useState(props.level);
    const [isUpdate, setIsUpdate] = useState(false);
    const [error, setError] = useState({});
    const [snackOpen, setSnackOpen] = useState(false);

    useEffect( () => {
        setLevel(props.level);
    }, [props.level]);

    const handleChange = (e) => {
        setLevel(e.target.value);
    }

    const handleUpdate = () => {
        if(!level){
            setError({
                level: 'Enter Level'
            });
            return;
        }

        const data = {
            level: `level_${level}`,
            index: `${props.selectedModule}`,
        }

        console.log(data);
        console.log(props.level);
        console.log(props.course_id);
        console.log(props.selectedModule);

        updateLevel({
            variables: {
                course_id: props.course_id,
                old_level: `level_${props.level}`,
                ...data
            }
        });
        
        setIsUpdate(false);
        setSnackOpen(true);
    }

    return (
        <div>
            {
                isUpdate ? (
                    <div>
                        <TextField fullWidth name="level" color="primary" className={classes.text}
                                placeholder="Enter Level" label="Level" onChange={handleChange}
                                error={error.level ? true : false} helperText={error.level} 
                                defaultValue={level ? level : props.level}
                        />    

                        <IconButton color='primary' onClick={handleUpdate}>
                            <CheckCircle />
                        </IconButton>
                        <IconButton color='secondary' onClick={() => setIsUpdate(false)}>
                            <CancelRounded />
                        </IconButton>
                    </div>
                ) : (
                    <div>
                        <Typography variant='subtitle1'>
                            {`Level - ${level ? level : props.level}`}
                        </Typography>
                        <Fab variant='extended' color='primary' size='small' onClick={() => setIsUpdate(true)}>
                            <Edit fontSize="small" />
                            Change Level
                        </Fab>
                    </div>
                )
            }

            <UpdateSnackbar open={snackOpen}/>
        </div>
    )
}

export default CreateModule;