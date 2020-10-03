import React, { useState, useEffect } from 'react';

//utils
import TipButton from '../../../../../utils/TipButton';

//mui
import { Typography, List, ListItem, TextField, Paper, Button, Switch } from '@material-ui/core';

//mui/icons
import { Edit, Clear, Cancel, CheckCircle } from '@material-ui/icons';

//mui/styles
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles( (theme) => ({
    button: {
        position: 'relative',
        margin: 10,
    },
    controls: {
        position: 'relative',
        margin: 10,
        display: 'flex'
    },
    text: {
        position: 'relative',
        margin:15, 
        width: '60%',
    },
    paper: {
        minHeight: 200,
    },
}));

const Hint = (props) => {
    const classes = useStyles();

    const { problem } = props.code;
    
    const [isAdd, setIsAdd] = useState(false);
    const [newHint, setNewHint] = useState();
    const [isEdit, setIsEdit] = useState(false);
    const [hints, setHints] = useState([]);

    useEffect( () => {
        setHints(problem.hints);
    }, [problem]);

    const handleHint = () => {
        setIsAdd(true);
    }

    const handleSwitch = (e) => {
        setIsEdit(e.target.checked);
    }

    const handleChange = (e) => {
        setNewHint(e.target.value);
    }

    const handleCancel = () => {
        setIsAdd(false);
    }

    const handleAddHint = () => {
        props.updateProblem({hints: [...hints, newHint]}, problem.problem_id);
        setIsAdd(false);
    }

    const handleEditHint = (index) => (e) => {
        hints[index] = e.target.value;
        setHints(hints);
    }

    const handleDeleteHint = (index) => () => {
        const temp = hints.filter( (h, ind) => ind !== index);
        
        setHints(temp);
    }

    const updateHints = () => {
        props.updateProblem({hints: [...hints]}, problem.problem_id);
    }

    return (
        <Paper className={classes.paper}>
            <div>
                <Typography variant='h6'>
                    Edit
                </Typography>
                <Switch color='primary' onChange={handleSwitch} inputProps={{"aria-label": 'Edit Hints'}} />
            </div>
            
            <List>
                {
                    hints.map( (h, index) => {
                        return (
                            <ListItem key={index}>
                                {
                                    isEdit ? (
                                        <TextField color='primary' label="Hint" placeholder="Enter Hint" value={newHint} onChange={handleEditHint((index))}
                                            className={classes.text} defaultValue={h} color='primary'
                                        />
                                    ) : (
                                        <Typography variant='body1'>
                                            {h}
                                        </Typography>
                                    )
                                }
                                {
                                    isEdit && (
                                        <TipButton tip="Delete Hint" btnColor='secondary' onClick={handleDeleteHint(index)} btnClassName={classes.button}>
                                            <Clear />
                                        </TipButton>
                                    )
                                }
                            </ListItem>
                        )
                    })
                }
                {
                    isAdd ? (
                        <div>
                            <TextField color='primary' label="Hint" placeholder="Enter Hint" value={newHint} onChange={handleChange}
                                className={classes.text}
                            />
                            <span className={classes.controls}>
                                <TipButton tip="Add Hint" btnColor='secondary' onClick={handleCancel} btnClassName={classes.button}>
                                    <Cancel />
                                </TipButton>
                                <TipButton tip="Add Hint" btnColor='primary' onClick={handleAddHint} btnClassName={classes.button}>
                                    <CheckCircle />
                                </TipButton>
                            </span>
                        </div>
                    ) : (
                        isEdit ? (
                            <Button variant='contained' color='primary' onClick={updateHints}>
                                Save Hints
                            </Button>
                        ) : (
                            <Button color='primary' variant='contained' onClick={handleHint} className={classes.button}>
                                Add Hint
                            </Button>
                        )
                    )
                }
            </List>
        </Paper>
    )
}

export default Hint;