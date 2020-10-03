import React, { useState } from 'react';
import _ from 'lodash';
//graphql
import { useMutation } from '@apollo/react-hooks';
import { VALIDATE_ANSWERS } from '../../../../graphql/mutation/mcqMutations';
import { GET_CURRENT_COURSE } from '../../../../graphql/queries/currentCourseQueries';

//mui
import { Paper, Typography, FormControlLabel, RadioGroup, Radio, Button, CircularProgress, TextField } from '@material-ui/core';
import { Dialog, DialogTitle, DialogActions, DialogContent, Backdrop } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

//mui/icons
import { CheckCircle } from '@material-ui/icons';

const useStyles = makeStyles( (theme) => ({
    question: {
        margin: 30,
        padding: 20,
        boxShadow: '1px 1px 1px 1px rgba(0, 0, 0, 0.5)'
    },

    answer: {
        color: theme.palette.success.main,
        fontWeight: 'bold',
    },

    options: {
        margin: 15,
    },

    body: {
        margin: 10,
    },

    backdrop: {
        zIndex: 4,
        color: '#fff'
    }
}));

const Test = (props) => {
    const classes = useStyles();

    const mcq = props.source;

    const [answers, setAnswers] = useState({});
    const [open, setOpen] = useState(false);
    const [completed, setCompleted] = useState(false);

    const [validateAnswers, { data, loading }] = useMutation(VALIDATE_ANSWERS, {
        onError: (err) => {
            console.log(err.message);
        },
        onCompleted: () => {
            setOpen(true);
            setCompleted(true);
        },
        refetchQueries: [
            {
                query: GET_CURRENT_COURSE,
                variables: {
                    course_id: props.course_id
                }
            }
        ]
    });

    const handleSelect = (index) => (e) => {
        const temp = answers;
        temp[index] = e.target.value;
        setAnswers(temp);
    }

    const handleSubmit = () => {
        const temp = _.fill(Array(mcq.questions.length), "");

        Object.keys(answers).forEach( (ans) => {
            temp[parseInt(ans)] = answers[ans];
        });

        console.log(temp);
        validateAnswers({
            variables: {
                mcq_id: mcq.mcq_id,
                answers: temp,
                preview: false,
                scope: props.scope
            }
        });
    }

    const handleClose = () => {
        setOpen(false);
    }

    return (
        <div>
            {
                mcq.questions && mcq.questions.map( (m, index) => {
                    return (
                        <Paper className={classes.question} key={index}>
                            <Typography variant='h5' color='primary'>
                                <strong>
                                    Question: {index + 1}
                                </strong>
                            </Typography>
                            <div className={classes.body}>
                                <Typography variant='body1'>
                                    {m.question}
                                </Typography>
                                <div className={classes.options}>
                                    {
                                        m.type === 'MCQ' ? (
                                            <RadioGroup aria-label='options' name='option' value={answers[index]} onChange={handleSelect(index)}>
                                                {
                                                    m.options.map( (op, ind) => {
                                                        return (
                                                            <span className={data && ind === parseInt(data.validateAnswers.answers[index]) ?
                                                                 classes.answer : null} key={ind}
                                                            >
                                                                <FormControlLabel key={ind} value={`${ind}`} label={op} control={<Radio />} />
                                                                {
                                                                    data && (
                                                                        ind === parseInt(data.validateAnswers.answers[index]) && (
                                                                            <CheckCircle className={classes.success} />
                                                                        )
                                                                    )
                                                                }
                                                            </span>
                                                        )
                                                    })
                                                }
                                            </RadioGroup>   
                                        ) : (
                                            <div>
                                                <TextField variant='outlined' color='primary' label='Answer' value={answers[index]}
                                                     onChange={handleSelect(index)} fullWidth
                                                />

                                                {
                                                    data && (
                                                        <Typography variant='subtitle1' className={classes.answer}>
                                                            Answer: 
                                                            <strong>
                                                                {data.validateAnswers.answers[index]}
                                                            </strong>
                                                        </Typography>
                                                    )
                                                }
                                            </div>
                                        )
                                    }
                                </div>
                                {
                                    data && (
                                        <div>
                                            <Typography variant='h6'>
                                                <strong>
                                                    Explanation
                                                </strong>
                                            </Typography>
                                            <Typography variant='body1'>
                                                {data.validateAnswers.explanation[index]}
                                            </Typography>
                                        </div>
                                    )
                                }
                            </div>
                        </Paper>
                    )
                })
            }
            {
                !completed && (
                    <Button variant='contained' onClick={handleSubmit} color='primary'>
                        Submit
                    </Button>
                )
            }

            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
                <DialogTitle>
                    <Typography color='primary'>
                        <strong>
                            Score Card
                        </strong>
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    {
                        data ? (
                            <div>
                                <Typography variant='h5'>
                                    Xp: <strong>{data.validateAnswers.score}</strong>
                                </Typography>
                            </div>
                        ) : (
                            <CircularProgress color='primary' size={50} />
                        )
                    }
                </DialogContent>
                {   
                    completed && (
                        <DialogActions>
                            <Button variant='contained' color='primary' onClick={handleClose}>
                                Ok
                            </Button>
                        </DialogActions>
                    )
                }
            </Dialog>
            <Backdrop open={loading} className={classes.backdrop}>
                <CircularProgress color='primary' size={50} />
            </Backdrop>
        </div>
    )
}

export default Test;