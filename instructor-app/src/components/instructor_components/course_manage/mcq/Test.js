import React, { useState, useEffect } from 'react';

//graphql
import { useLazyQuery } from '@apollo/react-hooks';
import { VALIDATE_ANSWERS } from '../../../../graphql/queries/mcqQueries';

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
}));

const Test = (props) => {
    const classes = useStyles();

    const [validateAnswers, { data, loading }] = useLazyQuery(VALIDATE_ANSWERS, {
        onError: (err) => {
            console.log(err);
        },
        onCompleted: () => {
            setOpen(true);
            setDropOpen(false);
        }
    });

    const mcq = props.source.source;

    const [answers, setAnswers] = useState({});
    const [open, setOpen] = useState(false);
    const [dropOpen, setDropOpen] = useState(false);

    useEffect( () => {
        mcq.questions.map( (m, index) => {
            answers[index] = '';
        });
    }, []);

    const handleSelect = (index) => (e) => {
        const temp = answers;
        temp[index] = e.target.value;
        setAnswers(temp);
    }

    const handleSubmit = () => {
        let data = [];

        Object.keys(answers).forEach( (ans) => {
            data.push(answers[ans]);
        });
        setDropOpen(true);
        validateAnswers({
            variables: {
                mcq_id: mcq.mcq_id,
                answers: data,
                preview: true
            }
        });
    }

    const handleClose = () => {
        setOpen(false);
    }

    return (
        <div>
            <Backdrop open={dropOpen} >
                <CircularProgress size={50} color='primary' />
            </Backdrop>
            {
                mcq.questions.map( (m, index) => {
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
                                                            <span className={data && `${ind}` === data.validateAnswers.answers[ind] ? classes.answer : null}>
                                                                <FormControlLabel key={ind} value={`${ind}`} label={op} control={<Radio />} />
                                                                {
                                                                    data && (
                                                                        ind === parseInt(data.validateAnswers.answers[index]) && (
                                                                            <CheckCircle className={classes.answer} />
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
                                                <TextField variant='outlined' color='primary' label='Anwer' value={answers[index]} onChange={handleSelect(index)}
                                                    fullWidth
                                                />

                                                {
                                                    data && (
                                                        <Typography variant='h6' className={classes.answer}>
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
                !data && (
                    <Button variant='contained' onClick={handleSubmit} color='primary'>
                        Submit
                    </Button>
                )
            }

            <Dialog open={open} fullWidth maxWidth="md">
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
                    data && (
                        <DialogActions>
                            <Button variant='contained' color='primary' onClick={handleClose}>
                                Ok
                            </Button>
                        </DialogActions>
                    )
                }
            </Dialog>
        </div>
    )
}

export default Test;