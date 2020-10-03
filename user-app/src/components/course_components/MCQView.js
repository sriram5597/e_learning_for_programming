import React, { useState } from 'react';

//redux
import { connect } from 'react-redux';
import { checkAnwers } from '../../redux/actions/mcqAction';

//MUI
import { RadioGroup, Radio, FormControl, FormControlLabel, FormLabel } from '@material-ui/core';
import { Button, Typography } from '@material-ui/core';

//MUI/styles
import { makeStyles } from '@material-ui/styles';

//MUI/icons
import { CheckCircle, CancelRounded } from '@material-ui/icons';

const useStyles = makeStyles( (theme) => ({
    quest: {
        position: "relative",
        margin: 20
    },
    correct: {
        backgroudColor: "#0bb90e"
    },
    wrong: {
        backgroundColor: '#d71b0e'
    },
    score: {
        color: '#0bb90e',
    }
}));

const MCQView = (props) => {
    const classes = useStyles();

    const { mcqs, scores } = props.mcq;
    const { course } = props.course;

    const [answers, setAnswers] = useState({});
    const [validated, setValidated] = useState(false);

    const handleOption = (mcqId) =>  (event) => {
        let temp = answers;
        temp[mcqId] = event.target.value;
        setAnswers(temp);
    }

    const handleSubmit = () => {
        const data = {
            answers: answers
        }
        setValidated(true);
        props.checkAnwers(data, course._id['$oid'], props.module.module._id['$oid']);
    }

    return (
        <div>
            {
                mcqs && mcqs.map( (mcq, index) => {
                    return(
                        <div className={classes.quest} key={mcq.id}>
                            <Typography  variant="h6" color="primary">
                                {`Question - ${index + 1}`}
                            </Typography>
                            <Typography variant="body1">
                                {mcq.question}
                            </Typography>
                            <Typography variant="caption">
                                {`Score: ${mcq.score}`}
                            </Typography>
                            <br/><br/>
                            <FormControl>
                                <FormLabel component="legend">
                                    Options
                                </FormLabel>
                                <RadioGroup name="options" onChange={handleOption(mcq.id)}>
                                    <span>
                                        {
                                            Object.keys(mcq.options).map( (op, index) => {
                                                return (
                                                    <div key={index}>
                                                        <FormControlLabel control={<Radio/>} key={op} value={op} label={mcq.options[op]} />
                                                        {
                                                            validated && scores.answers ? (
                                                                answers[mcq.id] === scores.answers[mcq.id] 
                                                                        && scores.answers[mcq.id] === op) ? (
                                                                    <CheckCircle color="primary"/>
                                                                ) : (
                                                                    answers[mcq.id] === op && (
                                                                        <CancelRounded color="secondary"/>
                                                                    )
                                                                ) : null
                                                        }
                                                    </div>
                                                )
                                            })
                                        }
                                    </span>
                                </RadioGroup>
                            </FormControl>
                            {
                                validated && scores.answers && scores.answers[mcq.id] !== answers[mcq.id] && (
                                    <div>
                                        <Typography variant="h6" color="primary">
                                            {`Answer: ${mcq.options[scores.answers[mcq.id]]}`}
                                        </Typography>
                                        <Typography variant="body1">
                                            <span>
                                                <strong>
                                                    Explanation :
                                                </strong>
                                            </span>
                                            <br/>
                                            {
                                                scores.explanation[mcq.id]
                                            }
                                        </Typography>
                                    </div>
                                )
                            }
                        </div>
                    )
                })
            }
            {
                mcqs.length > 0 && (
                    <Button variant="contained" color="primary" onClick={handleSubmit}>
                        Submit
                    </Button>
                )
            }
            <div>
                {
                    scores.score && (
                        <Typography variant="subtitle1">
                            Your Score
                            <span className={classes.score}>
                                <Typography variant="subtitle1">
                                    <strong>
                                        {scores.score + '\t'}
                                    </strong>
                                    Out of {scores.total}
                                </Typography>
                            </span>
                        </Typography>
                    )
                }
               
            </div>
        </div>
    )
}

const mapStateToProps = (state) => ({
    mcq: state.mcq,
    module: state.module,
    course: state.course,
});

const mapActionsToProps = {
    checkAnwers
}

export default connect(mapStateToProps, mapActionsToProps)(MCQView);