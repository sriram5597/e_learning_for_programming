import React, { useState } from 'react';
import _ from 'lodash';

//graphql
import { useLazyQuery } from '@apollo/react-hooks';
import { GET_TESTCASE } from '../../../../../../graphql/queries/problemQueries';

//utils
import TipButton from '../../../../../../utils/TipButton';

//mui
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Paper } from '@material-ui/core';
import { Button, CircularProgress, Grid } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

//mui/icons
import { Visibility } from '@material-ui/icons';

const useStyles = makeStyles( (theme) => ({
    paper: {
        position: 'relative',
        heght: '88%',
        padding: "20px",
    },

    head: {
        marginBottom: 15,
    }
}))

const ViewTestcase = (props) => {
    const classes = useStyles();

    const { index, problem } = props;

    const [open, setOpen] = useState(false);

    const [getTestcase, { data, loading }] = useLazyQuery(GET_TESTCASE, {
        onError: (err) => {
            console.log(err);
        }
    });

    const handleDownload = () => {
        setOpen(true);
        getTestcase({
            variables: {
                problem_id: problem.problem_id,
                index,
            }
        });
    }

    const handleClose = () => {
        setOpen(false);
    }

    const replaceLineBreak = (data) => {
        const lines =  data.split('\n').map( (d, index) => {
            return (
                <span key={index}>
                    {d}<br/>
                </span>

            )
        });

        return lines;
    }

    return (
        <span>
            <TipButton tip='view' btnColor="primary" onClick={handleDownload}>
                <Visibility />
            </TipButton>

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
                <DialogTitle>
                    <Typography color='primary'>
                        Testcase                        
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    {
                       loading || !data  ? (
                            <CircularProgress size={30} color='primary'/>
                        ) : (
                            <Grid container spacing={2}>
                                <Grid item md={6}>
                                    <Paper className={classes.paper}>
                                        <Typography variant="h6" className={classes.head}>
                                            <strong>
                                                Input
                                            </strong>
                                        </Typography>
                                        <Typography variant="subtitle1">
                                            {
                                                data.getTestcase.input ? (
                                                   replaceLineBreak(data.getTestcase.input)
                                                ) : "No Input"
                                            }
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item md={6}>
                                    <Paper className={classes.paper}>
                                        <Typography variant="h6" className={classes.head}>
                                            <strong>
                                                Output
                                            </strong>
                                        </Typography>
                                        <Typography variant="subtitle1">
                                            {replaceLineBreak(data.getTestcase.output)}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            </Grid>
                        )
                    }
                </DialogContent>
                <DialogActions>
                    <Button variant='contained' color='primary' onClick={handleClose}>
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
        </span>
    )
}

export default ViewTestcase;