import React, { useState } from 'react';

//mui
import { Dialog, DialogContent, DialogActions, TextField, Typography } from '@material-ui/core';
import { Button } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    button: {
        margin: 15
    },
    text: {
        margin: 20,
    }
}));

const ScoreDialog = (props) => {
    const classes = useStyles();

    const { problem } = props;

    const [open, setOpen] = useState(false);
    const [error, setError] = useState({});
    const [state, setState] = useState({
        max_score: problem.max_score,
    });

    const handleClose = () => {
        setOpen(false);
    }

    const handleOpen = () => {
        setOpen(true);
    }

    const handleChange = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value,
        });
    }

    const handleScore = () => {
        let data = {};

        if(!state.max_score){
            setError({
                ...error,
                max_score: 'Maximum Score cannot be empty',
            });
        }

        if(state.max_score !== problem.max_score){
            data.max_score = parseInt(state.max_score);
        }

        console.log(data);

        props.updateProblem({
            variables: {
                problem_id: problem.problem_id,
                problem: {
                    ...data
                }        
            }
        });

        setOpen(false);
    }

    return (
        <span>
            <Button variant='outlined' color='primary' onClick={handleOpen} className={classes.button}>
                Assign Scores
            </Button>
        
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <DialogContent>
                    <div>
                        <TextField name="max_score" label='Maximum Score' fullWidth onChange={handleChange} variant='outlined'
                            placeholder="Enter maximum score for this problem" error={error.max_score ? true : false} 
                            helperText={error.max_score ? error.max_score : null} defaultValue={state.max_score} className={classes.text}
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    {
                        error && (
                            <Button variant='contained' color='primary' onClick={handleScore}>
                                Assign
                            </Button>
                        )
                    }
                    <Button variant='outlined' color='secondary' onClick={handleClose}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </span>
    )
}

export default ScoreDialog;