import React, { useState } from 'react';

//graphql
import { useMutation } from '@apollo/react-hooks';
import { ADD_SOURCE } from '../../../../graphql/mutation/courseFlowMutations';

//utils
import formValidator from '../../../../utils/formValidator';

//mui
import { Button, TextField, Paper, CircularProgress, Typography } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    root: {
        position: 'absolute',
        width: '60%',
        height: 550,
        padding: 30,
        left: '10%',
        top: '20%',
        margin: 30,
    },

    text: {
        margin: 30,
        width: '90%',
    },

    button: {
        margin: 30,
        left: '40%',
    },

    errText: {
        color: theme.palette.alert.main,
        textAlign: 'center',
    }
}));

const CreateMCQ = (props) => {
    const classes = useStyles();
    
    const [state, setState] = useState({
        source_title: "",
        coins: "",
        points: "",
    });
    const [error, setError] = useState({});

    const [addSource, { loading }] = useMutation(ADD_SOURCE, {
        onError: (err) => {
            console.log(err);
        },
        onCompleted: () => {
            props.setOpen(false);
        },
        update: (cache, { data }) => {
            props.updateAfterMutation(cache, data.addSource);
        }
    });

    const handleChange = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value,
        });
    }

    const handleTest = () => {
        const err = formValidator(state);
        
        setError(err);
        if(Object.keys(err).length === 0){
            addSource({
                variables: {
                    course_id: props.course_id,
                    title: props.title,
                    source: {
                        source_title: state.source_title,
                        type: "MCQ"
                    },
                    test: {
                        points: parseInt(state.points),
                        coins: parseInt(state.coins)
                    }
                }
            });
        }
    }

    return (
        <Paper className={classes.root}>
            <TextField variant='outlined' color='primary' onChange={handleChange} name='source_title' placeholder='Enter Source Title'
                    label='Source Title' className={classes.text} error={error.source_title ? true : false}
                    helperText={error.source_title ? 'Source Title cannot be empty' : null}
            /><br/>
            <TextField variant='outlined' color='primary' onChange={handleChange} name='points' placeholder='Enter Experience Points'
                    label='Expirence Points' className={classes.text} error={error.points ? true : false}
                    helperText={error.points ? 'Source Title cannot be empty' : null}
            /><br/>
            <TextField variant='outlined' color='primary' onChange={handleChange} name='coins' placeholder='Enter Coins'
                    label='Coins' className={classes.text} error={error.coins ? true : false}
                    helperText={error.coins ? 'Source Title cannot be empty' : null}
            /><br/>
            <Button variant='contained' onClick={handleTest} color='primary' className={classes.button}
                disabled={loading ? true : false}
            >
                Create Test
                {
                    loading && (
                        <CircularProgress size={30} color='primary' />
                    )
                }
            </Button>
        </Paper>
    )
}

export default CreateMCQ;