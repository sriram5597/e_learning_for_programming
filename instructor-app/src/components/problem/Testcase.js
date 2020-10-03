import React, { useRef, useEffect } from 'react';

//redux
import { connect } from 'react-redux';

//components
import ViewTestcase from '../instructor_components/course_manage/problem_components/update_problems/update_dialogs/ViewTestcase';

//mui
import { Card, CardHeader, CardContent, Typography } from '@material-ui/core';
import { CircularProgress, Tooltip } from '@material-ui/core';
import { Table, TableRow, TableHead, TableBody, TableCell, TableContainer } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

//mui/icons
import { CheckCircle, Cancel, Error, TimerOff } from '@material-ui/icons';

const useStyles = makeStyles( (theme) => ({
    root: {
        margin: 30,
        width: '90%',
    },

    head: {
        color: theme.palette.primary.main,
    },

    result: {
        padding: 30,
        margin: 5,
        backgroundColor: '#D3D3D3',
    },

    tableHead: {
        color: theme.palette.primary.main,
        fontSize: '20px',
        fontWeight: 'bold',
    },

    progress: {
        position: 'relative',
        left: '30%'
    },

    passed: {
        color: theme.palette.success.main,
    },

    failed: {
        color: theme.palette.alert.main,
    }
}));

const SampleTestcase = (props) => {
    const classes = useStyles();
    const scrollViewRef = useRef();

    const { testcase_result, problem } = props;
    const { username } = props.auth;

    const test_length = Object.keys(testcase_result).length;
    const passed = testcase_result.filter( (testcase) => testcase['status'] === 'passed').length;
    const prbId = problem.problem_id;

    useEffect( () => {
        scrollViewRef.current.scrollIntoView({ behaviour: "smooth"});
    }, []);

    const getIcon = (status) => {
        switch(status){
            case 'failed':
                return (
                    <Tooltip title="failed">
                        <Cancel className={classes.failed} />
                    </Tooltip>
                )
            case 'passed':
                return (
                    <Tooltip title="success">
                        <CheckCircle className={classes.passed} />
                    </Tooltip>
                )
            case 'error':
                return (
                    <Tooltip title="error">
                        <Error className={classes.failed} />
                    </Tooltip>
                )

            case 'MLE':
                return (
                    <Tooltip title="Maximum Timelimit Exceeded">
                        <TimerOff className={classes.failed} />
                    </Tooltip>
                )
            default:
                return null;
        }
    }

    return (
        <Card className={classes.root} ref={scrollViewRef}>
            <CardHeader component='div' className={classes.head} title="Sample Testcase" />
            <CardContent>
                {
                    testcase_result ? (
                        <div>
                            <Typography variant='subtitle1' color='primary'>
                                {
                                    passed === test_length && 
                                        "Congratulations! "
                                }
                                You have passed <strong>{`${passed}/${test_length}`}</strong> Sample testcases
                            </Typography>

                            <TableContainer component='div'>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>
                                                <Typography variant='subtitle1'>
                                                    <strong>Testcase</strong>
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant='subtitle1'>
                                                    <strong>Status</strong>
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant='subtitle1'>
                                                    <strong>Score</strong>
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    
                                    <TableBody>
                                        {
                                            testcase_result.map((testcase, index) => {
                                                return (
                                                    <TableRow key={index}>
                                                        <TableCell>
                                                            {`Test - ${index + 1}`}
                                                            {
                                                                username === problem.username && (
                                                                    <ViewTestcase index={index} />
                                                                )
                                                            }
                                                        </TableCell>
                                                        <TableCell> 
                                                            {getIcon(testcase['status'])}
                                                        </TableCell>
                                                        <TableCell>
                                                            {
                                                                (testcase.status === 'passed') ? (
                                                                    problem.testcases.map( (test) => {
                                                                        if(test['input'] === `testcases/${prbId}/input/inp-${key}.txt`){
                                                                            return test.points
                                                                        }
                                                                        return ""   
                                                                    })
                                                                ) : (
                                                                    "0.0"
                                                                )
                                                            }
                                                        </TableCell>
                                                    </TableRow>                   
                                                )
                                            })
                                        }     
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </div>
                    ) : (
                        <CircularProgress size={25} color='primary' className={classes.progress} />
                    )
                }
            </CardContent>
        </Card>
    )
}

const mapStateToProps = (state) => ({
    code: state.code,
    auth: state.auth,
})

export default connect(mapStateToProps, null)(SampleTestcase);