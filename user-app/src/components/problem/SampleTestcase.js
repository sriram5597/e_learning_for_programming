import React,{ useEffect, useRef } from 'react';

//redux
import { connect } from 'react-redux';

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

    const { sample_result } = props;

    const sample_length = sample_result.length;
    const passed = sample_result.filter( (sample) => sample['status'] === 'passed').length;

    useEffect( () => {
        scrollViewRef.current.scrollIntoView({ behaviour: 'smooth' });
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
                    sample_result ? (
                        <div>
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
                                                    <strong>Expected Output</strong>
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant='subtitle1'>
                                                    <strong>Your Output</strong>
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    
                                    <TableBody>
                                        {
                                            sample_result.map((sample, index) => {
                                                return (
                                                    <TableRow key={index}>
                                                        <TableCell>
                                                            {`Sample - ${index + 1}`}
                                                        </TableCell>
                                                        <TableCell> 
                                                            {getIcon(sample['status'])}
                                                        </TableCell>
                                                        <TableCell>
                                                            {sample['expected']}
                                                        </TableCell>
                                                        <TableCell>
                                                            {sample['output']}
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

export default SampleTestcase;