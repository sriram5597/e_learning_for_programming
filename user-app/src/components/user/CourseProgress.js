import React, { useState, useEffect } from 'react';

//redux
import { connect } from 'react-redux';

//utils
import TipButton from '../../utils/TipButton';

//MUI
import { Paper, Typography, ListItem, List, Checkbox, TextField, Button } from '@material-ui/core';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@material-ui/core';

//MUI/styles
import { makeStyles } from '@material-ui/styles';

//MUI/icons
import {  Replay } from '@material-ui/icons';

const useStyles = makeStyles( (theme) => ({
    container: {
        position: "relative",
        padding: 40
    },
    title: {
        textAlign: 'center',
    },
    expect: {
        position: "relative",
        marginTop: 25,
    },
    selected: {
        textDecoration: "strike-though"
    },
}));

const CourseProgress = (props) => {
    const classes = useStyles();

    const { current } = props.current_course;

    const [selectedExpects, setSelectedExpects] = useState([]);
    const [newExpect, setNewExpect] = useState([]);

    const expectRules = [ 'Should not give expectations like getting placed into a company', 'Should be relevant to this course',
                            'Should give your clear vision you had when you opt this course', 
                            'Should give expectations according to your prioriy where highest should come first'
                        ];
    
    const expects = current ? current.expectations : [];
   
    const [open, setOpen] = useState(false);
    const [addError, setAddError] = useState();

    useEffect( () => {
        if(current.expectations && current.expectations.length === 0){
            setOpen(true);
        }
    }, [current]);

    const handleExpect = (index) => () => {
        setSelectedExpects([...selectedExpects, index]);
    }

    const handleNewExpect = (index) =>  (event) => {
        let temp = newExpect;
        if(event.target.value.trim() !== "")
            temp[index] = event.target.value;
        setNewExpect(temp);
    }

    const handleSubmitExpect = () => {
        if(newExpect.length < 3){
            setAddError("Expectaions should not be empty");
            return;
        }
        let data = {};
        data['expectations'] = newExpect;
        console.log(data);
        props.addCourseExpectations(data, current.courseId);
        setOpen(false);
    }

    const handleUndoExpect = (index) => () => {
        const temp = selectedExpects.filter( (ex) => ex !== index);
        console.log(temp);
        setSelectedExpects(temp);
    }

    return (
        <div>
            <Paper className={classes.container}>
                <Typography variant="h4" className={classes.title}>
                    Your Progress
                </Typography>
                <Typography variant="h5" color="primary">
                    Level:
                    <strong>
                        lvl-0
                    </strong>
                </Typography>
                <Typography variant="subtitle1">
                    Xp: <em>100pts</em>
                </Typography>
                <Typography variant="subtitle1">
                    Current Module:
                    <strong>
                        module-0
                    </strong>
                </Typography>
                <div className={classes.expect}>
                    <Typography variant="h5" color="primary">
                        Expectations
                    </Typography>
                    <List>
                        {
                            expects ? ( expects.map( (exp, index) => {
                                const flag = selectedExpects.indexOf(index) !== -1 ? true : false;

                                return ( 
                                        <ListItem key={index}>
                                            <Checkbox value={index} onChange={handleExpect(expects.indexOf(exp))} checked={flag}/>
                                            <span>
                                                {
                                                    flag ? (
                                                        <span>
                                                            <Typography variant="subtitle1" color="primary">
                                                                <strike>{exp}</strike>
                                                            
                                                                <span>
                                                                    <TipButton tip="undo your selection" onClick={handleUndoExpect(index)}>
                                                                        <Replay/>
                                                                    </TipButton>
                                                                </span>
                                                            </Typography>
                                                        </span>
                                                    ) : (
                                                        <Typography variant="subtitle1" >
                                                            {exp}
                                                        </Typography>
                                                    )
                                                }
                                            </span>
                                        </ListItem>
                                )
                            })) : (
                                <Typography variant="body1">
                                    Loading...
                                </Typography>
                            )
                        }
                    </List>
                </div>
            </Paper>
            <Dialog open={open} fullWidth maxWidth="md">
                <DialogTitle>
                    <Typography color="primary">
                        <strong>Add Expectaions</strong>
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <div>
                        <Typography variant="body1" >
                            You should fill 3 expectations which you have on this course. You can continue to course only when you fill
                            your expectations on this course. We do our best to meet all your expectations.
                            <em>Happy Learning!!!</em>
                        </Typography>
                        <Typography variant="subtitle1" color="primary" style={{marginTop: 10}}>
                            How to give Expectations?
                        </Typography>
                        <List>
                            {
                                expectRules.map( (ex, index) => {
                                    return (
                                        <ListItem key={index}>
                                            <em>{ex}</em>
                                        </ListItem>
                                    )
                                })
                            }
                        </List>
                        {
                        [1, 2, 3].map( (e, index) => {
                                return (
                                    <TextField variant="filled" onChange={handleNewExpect(index)} label={`Expectation - ${e}`}
                                            color="primary" multiline rows="3" fullWidth className={classes.expect} key={index}
                                    />
                                )
                            })
                        }
                        <Typography variant="subtitle1" color="secondary">
                            { addError && addError }
                        </Typography>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="primary" onClick={handleSubmitExpect}>
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

const mapStateToProps = (state) => ({
    current_course: state.current_course,
});

const mapActionsToProps = {
}

export default connect(mapStateToProps, mapActionsToProps)(CourseProgress);