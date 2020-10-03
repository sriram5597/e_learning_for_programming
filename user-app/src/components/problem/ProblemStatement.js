import React, { useState } from 'react';

//components
import ChartView from './ChartView';
import Hint from './Hint';

//utils
import DraftView from '../../utils/customEditor/view/DraftView';
import TipButton from '../../utils/TipButton';

//mui
import { Typography, Button } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

//mui/icon
import { DeviceHub } from '@material-ui/icons';

const useStyles = makeStyles( (theme) => ({
    head: {
        position: "relative",
        marginTop: "20px"
    },

    sampleHead: {
        marginTop: "10px",
    },

    statement: {
        position: 'relative',
        marginTop: 10,
        marginBottom: 2,
    },

    draftView: {
        position: 'relative',
        width: '90%',
    },

    chartButton: {
        float: 'right',
    },

    controls: {
        position: 'relative',
        margin: 10,
    }
}));

const ProblemStatement = (props) => {
    const classes = useStyles();

    const { problem } = props;

    return (
        <div>  
            <span>
                <Typography variant="h6" color="primary" className={classes.statement}>
                    Problem Statement
                </Typography>
                <div className={classes.draftView}>
                    <DraftView editorState={JSON.parse(problem.problem_description)} />
                </div>
            </span>
            <span>
                <Typography variant="h6" color='primary' className={classes.head}>
                    Input Format
                </Typography>
                <div className={classes.draftView}>
                    <DraftView editorState={JSON.parse(problem.input_format)} />
                </div>
            </span>
            <span>
                <Typography variant="h6" color='primary' className={classes.head}>
                    output Format
                </Typography>
                <div className={classes.draftView}>
                    <DraftView editorState={JSON.parse(problem.output_format)} />
                </div>
            </span>
            <span>
                <Typography variant="h6" color='primary' className={classes.head}>
                    Constraints
                </Typography>
                <div className={classes.draftView}>
                    <DraftView editorState={JSON.parse(problem.constraints)} />
                </div>
            </span>
            <span>
                <Typography variant="h6" color='primary' className={classes.head}>
                    Sample Testcases
                </Typography>
                {
                    problem.sample_testcases.map( (sample, index) => {
                        return (
                            <div key={index}>
                                <div>
                                    <Typography variant="subtitle1" className={classes.head}>
                                        <strong>{`Sample - ${index + 1}`}</strong>
                                    </Typography>
                                </div>
                                <div>
                                    <div>
                                        <Typography variant="subtitle1" className={classes.sampleHead}>
                                            Input
                                        </Typography>
                                        {
                                            sample.input.split('\n').map( (inp, index) => {
                                                return (
                                                    <Typography variant='body1'>
                                                        <em>{inp}</em>
                                                    </Typography>
                                                )
                                            })
                                        }
                                    </div>
                                    
                                    <div>
                                        <Typography variant="subtitle1" className={classes.sampleHead}>
                                            Output
                                        </Typography>
                                        <Typography variant="body1">
                                            <em>{sample.output}</em>
                                        </Typography>
                                    </div>
                                    <div>
                                        <Typography variant="subtitle1" className={classes.sampleHead}>
                                            Explanation
                                        </Typography>
                                        <div className={classes.draftView}>
                                            <DraftView editorState={JSON.parse(sample.explanation)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
            </span>
        </div>
    )
}

export default ProblemStatement;